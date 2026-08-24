import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const taskNames = [
  "T8-change-impact-analysis",
  "T9-capacity-allocation",
  "T10-event-projector",
];

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

for (const taskName of taskNames) {
  const directory = `benchmark/tasks/${taskName}`;
  const task = readJson(`${directory}/task.json`);
  const rubric = readJson(`${directory}/rubric.json`);
  assert.equal(task.id, taskName);
  assert.equal(task.version, "1.0.0");
  assert.equal(rubric.task_id, taskName);
  assert.equal(rubric.task_version, task.version);
  assert.equal(rubric.criteria.reduce((sum, item) => sum + item.points, 0), 100);
  assert.equal(rubric.total_points, 100);
  assert.ok(task.allowed_paths.length > 0);
  assert.ok(task.forbidden_actions.length > 0);
  assert.ok(task.acceptance_checks.length > 0);
  assert.ok(task.limits.max_wall_time_seconds > 0);
  assert.ok(existsSync(resolve(root, directory, task.prompt_path)));

  if (task.verification) {
    const privatePath = `benchmark/private/${task.verification.hidden_suite}.test.mjs`;
    assert.ok(existsSync(resolve(root, privatePath)), `missing ${privatePath}`);
    assert.equal(sha256(privatePath), task.verification.hidden_sha256);
    assert.ok(task.verification.visible_commands.length > 0);
  }
}

const matrix = readJson("benchmark/phase-2/run-matrix.json");
assert.equal(matrix.phase, "phase-2");
assert.equal(matrix.harness.assistant, "pi");
assert.equal(Object.keys(matrix.models).filter((name) => name !== "fable_fallback").length, 5);
assert.equal(matrix.blocks.length, 4);
assert.equal(matrix.blocks.reduce((sum, block) => sum + block.order.length, 0), 20);
assert.equal(matrix.planned_counted_runs, 20);
assert.equal(matrix.budget.approved_ceiling, 18);
assert.equal(matrix.budget.stop_starting_new_runs_at_recorded_spend, 16.5);
assert.ok(matrix.budget.stop_starting_new_runs_at_recorded_spend < matrix.budget.approved_ceiling);

const protocol = read("benchmark/phase-2/PROTOCOL.md");
for (const model of Object.values(matrix.models)) assert.ok(protocol.includes(model));
for (const taskName of taskNames) assert.ok(protocol.includes(taskName.split("-")[0]));

console.log("Phase 2 contracts, run matrix, rubrics, and private-suite hashes are valid.");
