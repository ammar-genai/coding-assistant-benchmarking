import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(root, relativePath), "utf8"));
}

for (const name of ["task", "run", "result"]) {
  const schema = readJson(`benchmark/schemas/${name}.schema.json`);
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.type, "object");
  assert.ok(Array.isArray(schema.required) && schema.required.length > 0);
}

const task = readJson("benchmark/tasks/T1-repo-map/task.json");
assert.equal(task.schema_version, "1.0");
assert.equal(task.id, "T1-repo-map");
assert.equal(task.mode, "read-only");
assert.ok(task.forbidden_actions.length > 0);
assert.ok(task.limits.max_wall_time_seconds > 0);

const prompt = readFileSync(resolve(root, "benchmark/tasks/T1-repo-map/prompt.md"), "utf8");
for (const heading of ["Architecture", "Main request flow", "Verification", "Risks and unknowns", "Small change plan"]) {
  assert.match(prompt, new RegExp(`^## ${heading}$`, "m"));
}

const rubric = readJson("benchmark/tasks/T1-repo-map/rubric.json");
const points = rubric.criteria.reduce((total, criterion) => total + criterion.points, 0);
assert.equal(points, rubric.total_points);
assert.equal(points, 100);

const claudeRules = readFileSync(resolve(root, "CLAUDE.md"), "utf8");
assert.match(claudeRules, /^@AGENTS\.md\b/);

console.log("Benchmark contracts are valid.");
