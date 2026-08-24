import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const targetRoot = process.env.BENCHMARK_TARGET_ROOT;

if (!targetRoot) {
  throw new Error("BENCHMARK_TARGET_ROOT is required");
}

const implementationUrl = pathToFileURL(
  path.join(
    targetRoot,
    "benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs",
  ),
);
implementationUrl.searchParams.set("run", `${process.pid}-${Date.now()}`);

const { selectComparisonRuns } = await import(implementationUrl.href);

test("allows a missing comparison_eligible value", () => {
  const run = {
    id: "default-eligible",
    status: "complete",
    acceptance_status: "pass",
  };

  assert.deepEqual(selectComparisonRuns([run]), [run]);
});

test("requires completion and acceptance even when comparison_eligible is true", () => {
  const runs = [
    {
      id: "pending",
      status: "pending",
      acceptance_status: "pass",
      comparison_eligible: true,
    },
    {
      id: "failed",
      status: "complete",
      acceptance_status: "fail",
      comparison_eligible: true,
    },
    {
      id: "both-invalid",
      status: "failed",
      acceptance_status: "fail",
      comparison_eligible: true,
    },
  ];

  assert.deepEqual(selectComparisonRuns(runs), []);
});

test("an explicit comparison exclusion wins over otherwise valid fields", () => {
  const excluded = {
    id: "excluded",
    status: "complete",
    acceptance_status: "pass",
    comparison_eligible: false,
  };

  assert.deepEqual(selectComparisonRuns([excluded]), []);
});

test("preserves eligible record order and identity without mutating frozen data", () => {
  const first = Object.freeze({
    id: "first",
    status: "complete",
    acceptance_status: "pass",
  });
  const rejected = Object.freeze({
    id: "rejected",
    status: "complete",
    acceptance_status: "fail",
  });
  const second = Object.freeze({
    id: "second",
    status: "complete",
    acceptance_status: "pass",
    comparison_eligible: true,
  });
  const runs = Object.freeze([first, rejected, second]);

  const result = selectComparisonRuns(runs);

  assert.deepEqual(result, [first, second]);
  assert.equal(result[0], first);
  assert.equal(result[1], second);
  assert.notEqual(result, runs);
});

test("retains the existing input validation contract", () => {
  assert.throws(
    () => selectComparisonRuns(null),
    new TypeError("runs must be an array"),
  );
});
