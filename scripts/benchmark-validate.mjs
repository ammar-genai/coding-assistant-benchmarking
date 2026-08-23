import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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

function validateWriteTask(taskId, expectedAllowedPaths) {
  const writeTask = readJson(`benchmark/tasks/${taskId}/task.json`);
  assert.equal(writeTask.schema_version, "1.0");
  assert.equal(writeTask.id, taskId);
  assert.equal(writeTask.mode, "workspace-write");
  assert.deepEqual(writeTask.allowed_paths, expectedAllowedPaths);
  assert.ok(writeTask.verification.visible_commands.length > 0);
  assert.equal(writeTask.verification.hidden_suite, taskId);
  assert.match(writeTask.verification.hidden_sha256, /^[a-f0-9]{64}$/);
  assert.ok(writeTask.limits.max_wall_time_seconds > 0);

  const writeRubric = readJson(`benchmark/tasks/${taskId}/rubric.json`);
  const writePoints = writeRubric.criteria.reduce(
    (total, criterion) => total + criterion.points,
    0,
  );
  assert.equal(writeRubric.task_id, writeTask.id);
  assert.equal(writeRubric.task_version, writeTask.version);
  assert.equal(writePoints, writeRubric.total_points);
  assert.equal(writePoints, 100);

  const privateSuite = resolve(
    root,
    "benchmark/private",
    `${writeTask.verification.hidden_suite}.test.mjs`,
  );
  assert.ok(existsSync(privateSuite), `Missing local private suite: ${privateSuite}`);
  const privateDigest = createHash("sha256").update(readFileSync(privateSuite)).digest("hex");
  assert.equal(privateDigest, writeTask.verification.hidden_sha256);

  const seededFailure = spawnSync(
    "/bin/sh",
    ["-lc", writeTask.verification.visible_commands[0]],
    { cwd: root, encoding: "utf8", timeout: 30_000 },
  );
  assert.notEqual(seededFailure.status, 0, `${taskId} must retain its seeded failing behavior`);
}

validateWriteTask("T2-filter-valid-runs", [
  "benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs",
]);
validateWriteTask("T3-comparison-summary", [
  "benchmark/fixtures/T3-comparison-summary/summarize-assistants.mjs",
  "benchmark/fixtures/T3-comparison-summary/render-comparison-table.mjs",
  "benchmark/fixtures/T3-comparison-summary/student-tests.mjs",
]);
validateWriteTask("T4-run-explorer", [
  "benchmark/fixtures/T4-run-explorer/index.html",
  "benchmark/fixtures/T4-run-explorer/styles.css",
  "benchmark/fixtures/T4-run-explorer/run-explorer.mjs",
  "benchmark/fixtures/T4-run-explorer/student-tests.mjs",
]);
validateWriteTask("T4-run-explorer-v2", [
  "benchmark/fixtures/T4-run-explorer/index.html",
  "benchmark/fixtures/T4-run-explorer/styles.css",
  "benchmark/fixtures/T4-run-explorer/run-explorer.mjs",
  "benchmark/fixtures/T4-run-explorer/student-tests.mjs",
]);
validateWriteTask("T5-review-queue", [
  "benchmark/fixtures/T5-review-queue/review-store.mjs",
  "benchmark/fixtures/T5-review-queue/review-api.mjs",
  "benchmark/fixtures/T5-review-queue/review-page.mjs",
  "benchmark/fixtures/T5-review-queue/student-tests.mjs",
  "benchmark/fixtures/T5-review-queue/README.md",
]);
validateWriteTask("T5-review-queue-v2", [
  "benchmark/fixtures/T5-review-queue/review-store.mjs",
  "benchmark/fixtures/T5-review-queue/review-api.mjs",
  "benchmark/fixtures/T5-review-queue/review-page.mjs",
  "benchmark/fixtures/T5-review-queue/student-tests.mjs",
  "benchmark/fixtures/T5-review-queue/README.md",
]);
validateWriteTask("T6-rejected-promise-cache", [
  "benchmark/fixtures/T6-rejected-promise-cache/config-cache.mjs",
  "benchmark/fixtures/T6-rejected-promise-cache/config-api.mjs",
  "benchmark/fixtures/T6-rejected-promise-cache/student-tests.mjs",
  "benchmark/fixtures/T6-rejected-promise-cache/INCIDENT.md",
]);

const claudeRules = readFileSync(resolve(root, "CLAUDE.md"), "utf8");
assert.match(claudeRules, /^@AGENTS\.md\b/);

const extensionBlock = readJson("benchmark/blocks/benchmark-audit-invocation-2026-08-23.json");
const extensionPrompt = readFileSync(
  resolve(root, extensionBlock.feature.prompt_path),
  "utf8",
);
const extensionPromptDigest = createHash("sha256").update(extensionPrompt).digest("hex");
assert.equal(extensionBlock.status, "preregistered");
assert.equal(extensionPromptDigest, extensionBlock.feature.prompt_sha256);
assert.deepEqual(extensionBlock.feature.required_tools, [
  "get_task_contract",
  "summarize_run",
]);
assert.equal(extensionBlock.run_policy.openrouter_calls, 0);
assert.equal(extensionBlock.run_policy.max_human_interventions, 0);

console.log("Benchmark contracts are valid.");
