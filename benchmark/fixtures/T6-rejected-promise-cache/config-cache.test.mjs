import assert from "node:assert/strict";
import test from "node:test";

import { createConfigApi } from "./config-api.mjs";
import { ConfigOriginError, createConfigCache } from "./config-cache.mjs";

const CONFIG = Object.freeze({ version: "v1", features: Object.freeze(["search"]) });

test("caches successful loads and returns isolated copies", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    return CONFIG;
  });

  const first = await cache.getConfig("acme");
  first.features.push("mutated");
  const second = await cache.getConfig(" acme ");

  assert.equal(calls, 1);
  assert.deepEqual(second, { version: "v1", features: ["search"] });
  assert.notEqual(first, second);
});

test("coalesces concurrent cache misses for one tenant", async () => {
  let release;
  let calls = 0;
  const origin = new Promise((resolve) => {
    release = resolve;
  });
  const cache = createConfigCache(async () => {
    calls += 1;
    return origin;
  });

  const first = cache.getConfig("acme");
  const second = cache.getConfig("acme");
  release(CONFIG);

  assert.deepEqual(await Promise.all([first, second]), [CONFIG, CONFIG]);
  assert.equal(calls, 1);
});

test("retries the origin after a transient load failure", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    if (calls === 1) {
      throw new ConfigOriginError("temporary timeout");
    }
    return CONFIG;
  });

  await assert.rejects(cache.getConfig("acme"), ConfigOriginError);
  assert.deepEqual(await cache.getConfig("acme"), CONFIG);
  assert.equal(calls, 2);
});

test("the API recovers on the request after a transient origin failure", async () => {
  let calls = 0;
  const cache = createConfigCache(async () => {
    calls += 1;
    if (calls === 1) {
      throw new ConfigOriginError("temporary timeout");
    }
    return CONFIG;
  });
  const handle = createConfigApi(cache);

  const failed = await handle({ method: "GET", url: "/api/config/acme" });
  const recovered = await handle({ method: "GET", url: "/api/config/acme" });

  assert.equal(failed.status, 503);
  assert.equal(failed.headers["retry-after"], "1");
  assert.equal(recovered.status, 200);
  assert.deepEqual(recovered.body, { config: CONFIG });
});

test("keeps tenants separate and supports targeted invalidation", async () => {
  const calls = [];
  const cache = createConfigCache(async (tenantId) => {
    calls.push(tenantId);
    return { version: `${tenantId}-${calls.length}`, features: [] };
  });

  await cache.getConfig("acme");
  await cache.getConfig("beta");
  cache.clear("acme");
  await cache.getConfig("acme");

  assert.deepEqual(calls, ["acme", "beta", "acme"]);
  assert.equal(cache.size(), 2);
});
