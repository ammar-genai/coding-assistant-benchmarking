import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");
const fixtureRoot = resolve(targetRoot, "benchmark/fixtures/T6-rejected-promise-cache");

async function load(file) {
  const url = pathToFileURL(resolve(fixtureRoot, file));
  return import(url.href);
}

const [{ createConfigApi }, { ConfigOriginError, createConfigCache }] = await Promise.all([
  load("config-api.mjs"),
  load("config-cache.mjs"),
]);

const CONFIG = { version: "v1", features: ["search"] };

function deferred() {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
}

test("evicts a rejected load and retries successfully", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    if (calls === 1) {
      throw new ConfigOriginError("timeout");
    }
    return CONFIG;
  });

  await assert.rejects(cache.getConfig("acme"), ConfigOriginError);
  assert.deepEqual(await cache.getConfig("acme"), CONFIG);
  assert.equal(calls, 2);
});

test("coalesces concurrent failures but allows the next read to retry", async () => {
  const firstLoad = deferred();
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    if (calls === 1) {
      return firstLoad.promise;
    }
    return CONFIG;
  });

  const first = cache.getConfig("acme");
  const second = cache.getConfig("acme");
  firstLoad.reject(new ConfigOriginError("timeout"));
  const failed = await Promise.allSettled([first, second]);

  assert.deepEqual(failed.map(({ status }) => status), ["rejected", "rejected"]);
  assert.equal(calls, 1);
  assert.deepEqual(await cache.getConfig("acme"), CONFIG);
  assert.equal(calls, 2);
});

test("does not let a late failure delete an overlapping replacement", async () => {
  const oldLoad = deferred();
  const replacement = deferred();
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    return calls === 1 ? oldLoad.promise : replacement.promise;
  });

  const oldRead = cache.getConfig("acme");
  cache.clear("acme");
  const newRead = cache.getConfig("acme");
  oldLoad.reject(new ConfigOriginError("old timeout"));
  await assert.rejects(oldRead, ConfigOriginError);
  replacement.resolve({ version: "v2", features: ["stable"] });

  assert.deepEqual(await newRead, { version: "v2", features: ["stable"] });
  assert.deepEqual(await cache.getConfig("acme"), { version: "v2", features: ["stable"] });
  assert.equal(calls, 2);
});

test("invalid origin data does not poison the tenant cache", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    return calls === 1 ? { version: "", features: [] } : CONFIG;
  });

  await assert.rejects(cache.getConfig("acme"), TypeError);
  assert.deepEqual(await cache.getConfig("acme"), CONFIG);
  assert.equal(calls, 2);
});

test("a failed tenant does not disturb a successful tenant", async () => {
  const calls = new Map();
  const cache = createConfigCache(async (tenantId) => {
    calls.set(tenantId, (calls.get(tenantId) ?? 0) + 1);
    if (tenantId === "broken" && calls.get(tenantId) === 1) {
      throw new ConfigOriginError("timeout");
    }
    return { version: tenantId, features: [] };
  });

  const stable = await cache.getConfig("stable");
  await assert.rejects(cache.getConfig("broken"), ConfigOriginError);
  assert.deepEqual(await cache.getConfig("stable"), stable);
  assert.deepEqual(await cache.getConfig("broken"), { version: "broken", features: [] });
  assert.deepEqual(Object.fromEntries(calls), { stable: 1, broken: 2 });
});

test("keeps successful caching, copy isolation, and invalidation", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => ({
    version: `v${++calls}`,
    features: ["one"],
  }));

  const first = await cache.getConfig(" acme ");
  first.features.push("changed");
  assert.deepEqual(await cache.getConfig("acme"), { version: "v1", features: ["one"] });
  cache.clear("acme");
  assert.deepEqual(await cache.getConfig("acme"), { version: "v2", features: ["one"] });
  assert.equal(cache.size(), 1);
});

test("preserves API status and headers while recovering", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    if (calls === 1) {
      throw new ConfigOriginError("timeout");
    }
    return CONFIG;
  });
  const handle = createConfigApi(cache);

  const unavailable = await handle({ method: "GET", url: "/api/config/acme" });
  const recovered = await handle({ method: "GET", url: "/api/config/acme" });
  assert.deepEqual(unavailable, {
    status: 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "1",
    },
    body: { error: "config_origin_unavailable" },
  });
  assert.equal(recovered.status, 200);
  assert.equal(recovered.headers["cache-control"], "no-store");
  assert.deepEqual(recovered.body, { config: CONFIG });
  assert.equal((await handle({ method: "POST", url: "/api/config/acme" })).status, 405);
  assert.equal((await handle({ method: "GET", url: "/missing" })).status, 404);
});

test("student tests contain meaningful regression coverage", async () => {
  const studentTests = await readFile(resolve(fixtureRoot, "student-tests.mjs"), "utf8");
  const declaredTests = studentTests.match(/\btest\s*\(/g) ?? [];

  assert.ok(declaredTests.length >= 3, "student-tests.mjs must declare at least three tests");
  assert.doesNotMatch(studentTests, /test\.(?:todo|skip)\s*\(/);
  assert.doesNotMatch(studentTests, /assert\.fail\s*\(/);
  assert.doesNotMatch(studentTests, /assert\.(?:ok|equal)\s*\(\s*true\b/);
});
