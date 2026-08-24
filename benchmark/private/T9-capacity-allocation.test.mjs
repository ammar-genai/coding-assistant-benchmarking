import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = process.env.BENCHMARK_TARGET_ROOT;
if (!root) throw new Error("BENCHMARK_TARGET_ROOT is required");
const { allocateCapacity } = await import(pathToFileURL(resolve(root, "benchmark/fixtures/T9-capacity-allocation/allocation-engine.mjs")));

test("preserves input order and does not mutate inputs", () => {
  const requests = [
    { id: "low", desk: "ABS", requested: 8, priority: 1, submittedAt: "2026-08-23T10:00:00Z" },
    { id: "high", desk: "ABS", requested: 8, priority: 9, submittedAt: "2026-08-23T10:01:00Z" },
  ];
  const capacities = { ABS: 10 };
  const before = structuredClone({ requests, capacities });
  assert.deepEqual(allocateCapacity(requests, capacities), [
    { id: "low", allocated: 2, unfilled: 6 },
    { id: "high", allocated: 8, unfilled: 0 },
  ]);
  assert.deepEqual({ requests, capacities }, before);
});

test("requires unique non-empty ids and a declared desk capacity", () => {
  const base = { desk: "ABS", requested: 8, priority: 1, submittedAt: "2026-08-23T10:00:00Z" };
  assert.throws(() => allocateCapacity([{ id: "x", ...base }, { id: "x", ...base }], { ABS: 10 }), TypeError);
  assert.throws(() => allocateCapacity([{ id: "", ...base }], { ABS: 10 }), TypeError);
  assert.throws(() => allocateCapacity([{ id: "x", ...base, desk: "CMBS" }], { ABS: 10 }), TypeError);
});

test("rejects invalid numeric fields and capacities atomically", () => {
  const base = { id: "x", desk: "ABS", requested: 8, priority: 1, submittedAt: "2026-08-23T10:00:00Z" };
  for (const request of [
    { ...base, requested: 0 },
    { ...base, requested: Number.NaN },
    { ...base, priority: 1.5 },
    { ...base, submittedAt: "invalid" },
  ]) assert.throws(() => allocateCapacity([request], { ABS: 10 }), TypeError);
  assert.throws(() => allocateCapacity([base], { ABS: -1 }), TypeError);
});

test("uses full deterministic priority ordering within each desk", () => {
  const rows = allocateCapacity([
    { id: "z", desk: "ABS", requested: 5, priority: 2, submittedAt: "2026-08-23T10:00:00Z" },
    { id: "a", desk: "ABS", requested: 5, priority: 2, submittedAt: "2026-08-23T10:00:00Z" },
    { id: "early", desk: "ABS", requested: 5, priority: 2, submittedAt: "2026-08-23T09:00:00Z" },
    { id: "top", desk: "ABS", requested: 5, priority: 3, submittedAt: "2026-08-23T11:00:00Z" },
  ], { ABS: 12 });
  assert.deepEqual(rows, [
    { id: "z", allocated: 0, unfilled: 5 },
    { id: "a", allocated: 2, unfilled: 3 },
    { id: "early", allocated: 5, unfilled: 0 },
    { id: "top", allocated: 5, unfilled: 0 },
  ]);
});

test("requires at least three meaningful student tests", async () => {
  const source = await import("node:fs/promises").then(({ readFile }) => readFile(resolve(root, "benchmark/fixtures/T9-capacity-allocation/student-tests.mjs"), "utf8"));
  const count = (source.match(/\btest\s*\(/g) ?? []).length;
  assert.ok(count >= 3, `expected at least 3 student tests, found ${count}`);
  assert.doesNotMatch(source, /replace this placeholder/i);
});
