import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;

if (!targetRoot) {
  throw new Error("BENCHMARK_TARGET_ROOT is required");
}

async function importTarget(relativePath) {
  const url = pathToFileURL(path.join(targetRoot, relativePath));
  url.searchParams.set("run", `${process.pid}-${Date.now()}-${relativePath}`);
  return import(url.href);
}

const { summarizeAssistants } = await importTarget(
  "benchmark/fixtures/T3-comparison-summary/summarize-assistants.mjs",
);
const { renderComparisonTable } = await importTarget(
  "benchmark/fixtures/T3-comparison-summary/render-comparison-table.mjs",
);

function run(overrides = {}) {
  return {
    run_id: "run-1",
    assistant: "Codex",
    status: "complete",
    acceptance_status: "pass",
    score: 90,
    elapsed_ms: 1_000,
    ...overrides,
  };
}

test("defaults a missing comparison_eligible field to eligible", () => {
  assert.deepEqual(summarizeAssistants([run()]), [
    {
      assistant: "Codex",
      run_count: 1,
      best_score: 90,
      best_run_id: "run-1",
      median_elapsed_ms: 1_000,
    },
  ]);
});

test("filters before validating record fields", () => {
  const invalidButRejected = {
    status: "failed",
    acceptance_status: "fail",
    comparison_eligible: false,
  };

  assert.deepEqual(summarizeAssistants([invalidButRejected]), []);
});

test("rejects invalid eligible records and invalid top-level inputs", () => {
  assert.throws(() => summarizeAssistants(null), TypeError);
  assert.throws(() => summarizeAssistants([run({ run_id: "" })]), TypeError);
  assert.throws(() => summarizeAssistants([run({ assistant: "" })]), TypeError);
  assert.throws(() => summarizeAssistants([run({ score: Number.NaN })]), TypeError);
  assert.throws(() => summarizeAssistants([run({ score: 101 })]), TypeError);
  assert.throws(() => summarizeAssistants([run({ elapsed_ms: -1 })]), TypeError);
  assert.throws(() => summarizeAssistants([run({ elapsed_ms: Infinity })]), TypeError);
});

test("uses numeric medians for odd and even run counts", () => {
  const summaries = summarizeAssistants([
    run({ run_id: "a", assistant: "Even", elapsed_ms: 10 }),
    run({ run_id: "b", assistant: "Even", elapsed_ms: 100 }),
    run({ run_id: "c", assistant: "Odd", elapsed_ms: 3 }),
    run({ run_id: "d", assistant: "Odd", elapsed_ms: 20 }),
    run({ run_id: "e", assistant: "Odd", elapsed_ms: 100 }),
  ]);

  assert.equal(summaries.find((summary) => summary.assistant === "Even").median_elapsed_ms, 55);
  assert.equal(summaries.find((summary) => summary.assistant === "Odd").median_elapsed_ms, 20);
});

test("uses run_id as the final best-run tie breaker", () => {
  const summary = summarizeAssistants([
    run({ run_id: "z-run", score: 98, elapsed_ms: 800 }),
    run({ run_id: "a-run", score: 98, elapsed_ms: 800 }),
  ])[0];

  assert.equal(summary.best_run_id, "a-run");
});

test("sorts assistant names by normal JavaScript string comparison", () => {
  const summaries = summarizeAssistants([
    run({ run_id: "lower", assistant: "alpha" }),
    run({ run_id: "upper", assistant: "Beta" }),
  ]);

  assert.deepEqual(summaries.map((summary) => summary.assistant), ["Beta", "alpha"]);
});

test("does not mutate frozen input data", () => {
  const first = Object.freeze(run({ run_id: "first", elapsed_ms: 2_000 }));
  const second = Object.freeze(run({ run_id: "second", elapsed_ms: 1_000 }));
  const runs = Object.freeze([first, second]);

  const result = summarizeAssistants(runs);

  assert.equal(result[0].median_elapsed_ms, 1_500);
  assert.deepEqual(runs, [first, second]);
});

test("renders escaping, decimal seconds, and the exact empty state", () => {
  assert.equal(
    renderComparisonTable([
      {
        assistant: "A|B",
        run_count: 1,
        best_score: 99.25,
        best_run_id: "best|run",
        median_elapsed_ms: 5,
      },
    ]),
    [
      "| Assistant | Runs | Best score | Best run | Median time |",
      "|---|---:|---:|---|---:|",
      "| A\\|B | 1 | 99.25 | best\\|run | 0.005 s |",
    ].join("\n"),
  );

  assert.equal(
    renderComparisonTable([]),
    [
      "| Assistant | Runs | Best score | Best run | Median time |",
      "|---|---:|---:|---|---:|",
      "",
      "_No eligible runs._",
    ].join("\n"),
  );
});

test("validates supplied summary records", () => {
  assert.throws(() => renderComparisonTable(null), TypeError);
  assert.throws(() => renderComparisonTable([{}]), TypeError);
  assert.throws(
    () => renderComparisonTable([
      {
        assistant: "Codex",
        run_count: 0,
        best_score: 90,
        best_run_id: "run-1",
        median_elapsed_ms: 1_000,
      },
    ]),
    TypeError,
  );
});

test("requires at least two real assistant-authored tests", async () => {
  const studentTestPath = path.join(
    targetRoot,
    "benchmark/fixtures/T3-comparison-summary/student-tests.mjs",
  );
  const source = await readFile(studentTestPath, "utf8");
  const declaredTests = source.match(/\btest\s*\(/g) ?? [];

  assert.ok(declaredTests.length >= 2, "student-tests.mjs must declare at least two tests");
  assert.doesNotMatch(source, /\btest\.(?:todo|skip)\s*\(/);
  assert.doesNotMatch(source, /assert\.(?:ok|equal)\s*\(\s*true\b/);
});
