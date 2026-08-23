import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import test from "node:test";
import { fileURLToPath } from "node:url";

const serverPath = resolve(dirname(fileURLToPath(import.meta.url)), "server.mjs");
const fixtureRoot = await mkdtemp(resolve(tmpdir(), "benchmark-audit-mcp-"));
const taskRoot = resolve(fixtureRoot, "benchmark/tasks/T9-sample");
const runId = "2026-08-23T10-00-00.000Z_codex_T9-sample";
const runRoot = resolve(fixtureRoot, "benchmark/runs", runId);
const prompt = "# Sample task\n\nDo the bounded work.\n";
const promptHash = createHash("sha256").update(prompt).digest("hex");

await Promise.all([mkdir(taskRoot, { recursive: true }), mkdir(runRoot, { recursive: true })]);
await Promise.all([
  writeFile(resolve(taskRoot, "task.json"), JSON.stringify({
    id: "T9-sample",
    version: "1.0.0",
    title: "Sample task",
    type: "analysis",
    mode: "read-only",
    prompt_path: "prompt.md",
    allowed_paths: ["**/*"],
    forbidden_actions: ["Do not write"],
    acceptance_checks: [{ id: "answer", description: "Return an answer" }],
    verification: { visible_commands: [], hidden_suite: null },
  })),
  writeFile(resolve(taskRoot, "prompt.md"), prompt),
  writeFile(resolve(taskRoot, "rubric.json"), JSON.stringify({
    total_points: 100,
    criteria: [{ id: "answer", points: 100, description: "Correct answer" }],
  })),
  writeFile(resolve(runRoot, "manifest.json"), JSON.stringify({
    task: { id: "T9-sample", version: "1.0.0" },
    assistant: "codex",
    assistant_version: "test",
    model: "test-model",
    access_path: "subscription",
    repository: { git_commit: "abc123", dirty_at_start: false },
    prompt_sha256: promptHash,
    settings: { max_human_interventions: 0 },
  })),
  writeFile(resolve(runRoot, "result.json"), JSON.stringify({
    status: "complete",
    acceptance_status: "pass",
    elapsed_ms: 1234,
    timed_out: false,
    changed_paths: [],
    notes: [],
  })),
  writeFile(resolve(runRoot, "changes.json"), JSON.stringify({
    changed_paths: [],
    out_of_scope_paths: [],
  })),
  writeFile(resolve(runRoot, "verification.json"), JSON.stringify({
    results: [
      { kind: "visible", exit_code: 0, timed_out: false },
      { kind: "private", exit_code: 0, timed_out: false },
    ],
    infrastructure_errors: [],
  })),
  writeFile(resolve(runRoot, "prompt.md"), prompt),
  writeFile(resolve(runRoot, "changes.patch"), ""),
  writeFile(resolve(runRoot, "stdout.log"), "sensitive transcript omitted by tool"),
  writeFile(resolve(runRoot, "stderr.log"), ""),
]);

const child = spawn(process.execPath, [serverPath, "--root", fixtureRoot], {
  stdio: ["pipe", "pipe", "pipe"],
});
const pending = new Map();
let requestId = 0;
let stderr = "";
child.stderr.on("data", (chunk) => { stderr += chunk; });
createInterface({ input: child.stdout }).on("line", (line) => {
  const message = JSON.parse(line);
  const resolveRequest = pending.get(message.id);
  if (resolveRequest) {
    pending.delete(message.id);
    resolveRequest(message);
  }
});

function request(method, params = {}) {
  requestId += 1;
  const id = requestId;
  return new Promise((resolveRequest, rejectRequest) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      rejectRequest(new Error(`MCP request timed out: ${method}; stderr=${stderr}`));
    }, 3_000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      resolveRequest(message);
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
}

test.after(async () => {
  child.stdin.end();
  await new Promise((resolveExit) => child.once("exit", resolveExit));
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("negotiates MCP and exposes only two read-only tools", async () => {
  const initialized = await request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  });
  assert.equal(initialized.result.protocolVersion, "2025-11-25");
  assert.deepEqual(initialized.result.capabilities, { tools: { listChanged: false } });

  const listed = await request("tools/list");
  assert.deepEqual(listed.result.tools.map(({ name }) => name), [
    "get_task_contract",
    "summarize_run",
  ]);
  assert.ok(listed.result.tools.every((tool) => tool.annotations.readOnlyHint));
  assert.ok(listed.result.tools.every((tool) => tool.inputSchema.additionalProperties === false));
});

test("returns a task contract without private test contents", async () => {
  const response = await request("tools/call", {
    name: "get_task_contract",
    arguments: { task_id: "T9-sample" },
  });

  assert.equal(response.result.structuredContent.task.id, "T9-sample");
  assert.equal(response.result.structuredContent.prompt_sha256, promptHash);
  assert.equal(response.result.structuredContent.rubric_total_points, 100);
  assert.doesNotMatch(response.result.content[0].text, /sensitive transcript/);
});

test("summarizes run integrity, scope, artifacts, and checks without logs", async () => {
  const response = await request("tools/call", {
    name: "summarize_run",
    arguments: { run_id: runId },
  });
  const summary = response.result.structuredContent;

  assert.equal(summary.acceptance_status, "pass");
  assert.equal(summary.prompt_matches_manifest, true);
  assert.equal(summary.prompt_matches_current_task, true);
  assert.deepEqual(summary.out_of_scope_paths, []);
  assert.deepEqual(summary.verification.visible, { total: 1, passed: 1, failed: 0, timed_out: 0 });
  assert.deepEqual(summary.verification.private, { total: 1, passed: 1, failed: 0, timed_out: 0 });
  assert.ok(Object.values(summary.artifacts_present).every(Boolean));
  assert.doesNotMatch(response.result.content[0].text, /sensitive transcript|benchmark-audit-mcp-/);
});

test("rejects traversal, extra arguments, and unknown tools without side effects", async () => {
  const traversal = await request("tools/call", {
    name: "get_task_contract",
    arguments: { task_id: "../../private" },
  });
  const extra = await request("tools/call", {
    name: "summarize_run",
    arguments: { run_id: runId, include_logs: true },
  });
  const unknown = await request("tools/call", { name: "delete_run", arguments: {} });

  assert.equal(traversal.result.isError, true);
  assert.equal(extra.result.isError, true);
  assert.equal(unknown.result.isError, true);
  assert.match(unknown.result.content[0].text, /Unknown benchmark-audit tool/);
});
