import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.env.BENCHMARK_TARGET_ROOT;
if (!root) throw new Error("BENCHMARK_TARGET_ROOT is required");
const fixture = resolve(root, "benchmark/fixtures/T10-event-projector");
const { createEventProjector } = await import(pathToFileURL(resolve(fixture, "event-projector.mjs")));
const created = (tradeId = "t1") => ({ tradeId, version: 1, type: "CREATED", payload: { notional: 10, owner: "desk" } });

test("different trades are not serialized behind each other", async () => {
  let release;
  const blocked = new Promise((resolveBlocked) => { release = resolveBlocked; });
  const started = [];
  const projector = createEventProjector(async (tradeId) => {
    started.push(tradeId);
    if (tradeId === "slow") await blocked;
  });
  const slow = projector.project(created("slow"));
  await Promise.resolve();
  const fast = projector.project(created("fast"));
  await fast;
  assert.deepEqual(started, ["slow", "fast"]);
  release();
  await slow;
});

test("duplicate or stale versions are ignored without persistence", async () => {
  let writes = 0;
  const projector = createEventProjector(async () => { writes += 1; });
  await projector.project(created());
  const duplicate = await projector.project(created());
  assert.equal(duplicate.version, 1);
  assert.equal(writes, 1);
});

test("version gaps and invalid first events are rejected", async () => {
  const projector = createEventProjector(async () => {});
  await assert.rejects(projector.project({ tradeId: "t1", version: 2, type: "AMENDED", payload: { notional: 12 } }), /version|created/i);
  await projector.project(created());
  await assert.rejects(projector.project({ tradeId: "t1", version: 3, type: "AMENDED", payload: { notional: 12 } }), /version/i);
});

test("cancelled trades are terminal", async () => {
  const projector = createEventProjector(async () => {});
  await projector.project(created());
  await projector.project({ tradeId: "t1", version: 2, type: "CANCELLED", payload: {} });
  await assert.rejects(projector.project({ tradeId: "t1", version: 3, type: "AMENDED", payload: { notional: 20 } }), /cancel/i);
});

test("snapshots and callback values cannot mutate committed state", async () => {
  const projector = createEventProjector(async (_tradeId, state, event) => {
    state.notional = 999;
    event.payload.notional = 999;
  });
  const input = created();
  await projector.project(input);
  input.payload.notional = 777;
  const snapshot = projector.getSnapshot("t1");
  assert.equal(snapshot.notional, 10);
  snapshot.notional = 888;
  assert.equal(projector.getSnapshot("t1").notional, 10);
});

test("requires meaningful tests and a completed incident report", async () => {
  const student = await readFile(resolve(fixture, "student-tests.mjs"), "utf8");
  assert.ok((student.match(/\btest\s*\(/g) ?? []).length >= 4);
  assert.doesNotMatch(student, /replace this placeholder/i);
  const incident = await readFile(resolve(fixture, "INCIDENT.md"), "utf8");
  for (const heading of ["Impact", "Root cause", "Fix", "Regression coverage", "Remaining risk"]) {
    assert.match(incident, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.doesNotMatch(incident, /Complete after/i);
});
