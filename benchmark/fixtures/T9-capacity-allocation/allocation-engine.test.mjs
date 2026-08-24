import assert from "node:assert/strict";
import test from "node:test";

import { allocateCapacity } from "./allocation-engine.mjs";

test("allocates each desk independently by priority", () => {
  const requests = [
    { id: "a", desk: "ABS", requested: 70, priority: 1, submittedAt: "2026-08-23T10:00:00Z" },
    { id: "b", desk: "ABS", requested: 60, priority: 3, submittedAt: "2026-08-23T10:01:00Z" },
    { id: "c", desk: "RMBS", requested: 40, priority: 2, submittedAt: "2026-08-23T10:02:00Z" },
  ];

  assert.deepEqual(allocateCapacity(requests, { ABS: 100, RMBS: 25 }), [
    { id: "a", allocated: 40, unfilled: 30 },
    { id: "b", allocated: 60, unfilled: 0 },
    { id: "c", allocated: 25, unfilled: 15 },
  ]);
});

test("uses submission time and then id as deterministic tie breakers", () => {
  const requests = [
    { id: "b", desk: "CMBS", requested: 30, priority: 2, submittedAt: "2026-08-23T11:00:00Z" },
    { id: "a", desk: "CMBS", requested: 30, priority: 2, submittedAt: "2026-08-23T11:00:00Z" },
  ];

  assert.deepEqual(allocateCapacity(requests, { CMBS: 45 }), [
    { id: "b", allocated: 15, unfilled: 15 },
    { id: "a", allocated: 30, unfilled: 0 },
  ]);
});

test("validates the entire request set before allocating", () => {
  assert.throws(() => allocateCapacity([
    { id: "a", desk: "ABS", requested: 10, priority: 1, submittedAt: "not-a-date" },
  ], { ABS: 10 }), TypeError);
});
