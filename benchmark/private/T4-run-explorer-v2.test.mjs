import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;
assert.ok(targetRoot, "BENCHMARK_TARGET_ROOT is required");

const fixtureRoot = resolve(targetRoot, "benchmark/fixtures/T4-run-explorer");
const implementationUrl = pathToFileURL(resolve(fixtureRoot, "run-explorer.mjs"));
implementationUrl.searchParams.set("private", `${process.pid}-${Date.now()}`);
const { filterRuns, sortRuns, summarizeRuns } = await import(implementationUrl.href);

function run(id, overrides = {}) {
  return Object.freeze({
    id,
    assistant: "Codex",
    model: "Model",
    outcome: "pass",
    score: 90,
    elapsedSeconds: 10,
    costUsd: null,
    ...overrides,
  });
}

test("rejects non-array inputs", () => {
  assert.throws(() => filterRuns(null, { assistant: "all", outcome: "all" }), TypeError);
  assert.throws(() => sortRuns({}, "time-asc"), TypeError);
  assert.throws(() => summarizeRuns("runs"), TypeError);
});

test("supports all filters and returns a fresh array", () => {
  const input = Object.freeze([
    run("a", { assistant: "Codex", outcome: "pass" }),
    run("b", { assistant: "Claude Code", outcome: "fail" }),
  ]);

  assert.deepEqual(filterRuns(input, { assistant: "all", outcome: "all" }), input);
  assert.notEqual(filterRuns(input, { assistant: "all", outcome: "all" }), input);
  assert.deepEqual(
    filterRuns(input, { assistant: "all", outcome: "fail" }).map((item) => item.id),
    ["b"],
  );
});

test("sorts time ascending with score and ID tie breakers", () => {
  const input = Object.freeze([
    run("z", { score: 92, elapsedSeconds: 8 }),
    run("b", { score: 91, elapsedSeconds: 5 }),
    run("a", { score: 91, elapsedSeconds: 5 }),
    run("c", { score: 95, elapsedSeconds: 5 }),
  ]);

  assert.deepEqual(sortRuns(input, "time-asc").map((item) => item.id), ["c", "a", "b", "z"]);
});

test("sorts known costs first and leaves subscription costs last", () => {
  const input = Object.freeze([
    run("unknown-fast", { score: 99, costUsd: null }),
    run("costly", { score: 80, costUsd: 0.12 }),
    run("cheap-b", { score: 90, costUsd: 0.03 }),
    run("cheap-a", { score: 95, costUsd: 0.03 }),
  ]);

  assert.deepEqual(
    sortRuns(input, "cost-asc").map((item) => item.id),
    ["cheap-a", "cheap-b", "costly", "unknown-fast"],
  );
});

test("summarizes empty and even-sized sets", () => {
  assert.deepEqual(summarizeRuns([]), {
    visibleCount: 0,
    passRatePct: 0,
    medianElapsedSeconds: 0,
    totalCostUsd: 0,
    costedRunCount: 0,
  });

  assert.deepEqual(
    summarizeRuns([
      run("a", { elapsedSeconds: 4, costUsd: 0.1 }),
      run("b", { outcome: "fail", elapsedSeconds: 10, costUsd: 0.2 }),
      run("c", { elapsedSeconds: 6, costUsd: null }),
      run("d", { outcome: "fail", elapsedSeconds: 8, costUsd: 0.3 }),
    ]),
    {
      visibleCount: 4,
      passRatePct: 50,
      medianElapsedSeconds: 7,
      totalCostUsd: 0.6,
      costedRunCount: 3,
    },
  );
});

test("uses safe DOM construction and includes meaningful student tests", async () => {
  const [source, studentTests] = await Promise.all([
    readFile(resolve(fixtureRoot, "run-explorer.mjs"), "utf8"),
    readFile(resolve(fixtureRoot, "student-tests.mjs"), "utf8"),
  ]);

  assert.doesNotMatch(source, /\.innerHTML\s*=/);
  assert.match(source, /createElement\s*\(/);
  const declaredTests = studentTests.match(/\btest\s*\(/g) ?? [];
  assert.ok(declaredTests.length >= 2, "student-tests.mjs must declare at least two tests");
  assert.doesNotMatch(studentTests, /test\.(?:todo|skip)\s*\(/);
  assert.doesNotMatch(studentTests, /assert\.(?:ok|equal)\s*\(\s*true\b/);
});

test("provides required summary landmarks and reduced-motion support", async () => {
  const [html, css] = await Promise.all([
    readFile(resolve(fixtureRoot, "index.html"), "utf8"),
    readFile(resolve(fixtureRoot, "styles.css"), "utf8"),
  ]);

  assert.match(html, /id=["']visible-count["']/i);
  assert.match(html, /id=["']pass-rate["']/i);
  assert.match(html, /id=["']median-time["']/i);
  assert.match(html, /id=["']known-cost["']/i);
  assert.match(css, /prefers-reduced-motion/i);
});
