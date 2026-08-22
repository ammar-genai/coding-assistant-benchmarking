import assert from "node:assert/strict";
import test from "node:test";

import { selectComparisonRuns } from "./select-comparison-runs.mjs";

test("keeps only completed, accepted, comparison-eligible runs", () => {
  const accepted = {
    id: "accepted",
    status: "complete",
    acceptance_status: "pass",
    comparison_eligible: true,
  };

  const runs = [
    accepted,
    {
      id: "failed-checks",
      status: "complete",
      acceptance_status: "fail",
      comparison_eligible: true,
    },
    {
      id: "interrupted",
      status: "failed",
      acceptance_status: "pass",
      comparison_eligible: true,
    },
    {
      id: "excluded",
      status: "complete",
      acceptance_status: "pass",
      comparison_eligible: false,
    },
  ];

  assert.deepEqual(selectComparisonRuns(runs), [accepted]);
});

test("preserves input order, object identity, and the input array", () => {
  const first = {
    id: "first",
    status: "complete",
    acceptance_status: "pass",
  };
  const second = {
    id: "second",
    status: "complete",
    acceptance_status: "pass",
    comparison_eligible: true,
  };
  const runs = Object.freeze([first, second]);

  const result = selectComparisonRuns(runs);

  assert.deepEqual(result, [first, second]);
  assert.equal(result[0], first);
  assert.equal(result[1], second);
  assert.notEqual(result, runs);
});
