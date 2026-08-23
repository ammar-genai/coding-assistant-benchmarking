#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

const SERVER_NAME = "coding-assistant-benchmark-audit";
const SERVER_VERSION = "1.0.0";
const LATEST_PROTOCOL = "2025-11-25";
const SUPPORTED_PROTOCOLS = new Set([
  LATEST_PROTOCOL,
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
]);

function parseRoot(argv) {
  const rootIndex = argv.indexOf("--root");
  if (rootIndex !== -1) {
    const value = argv[rootIndex + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("--root requires a repository path");
    }
    return resolve(value);
  }

  return resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

const projectRoot = parseRoot(process.argv.slice(2));
if (!existsSync(resolve(projectRoot, "benchmark"))) {
  throw new Error("The MCP root must contain the benchmark directory");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function requireOnlyKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new TypeError(`${label} contains unsupported fields: ${unknown.sort().join(", ")}`);
  }
}

function requireIdentifier(value, pattern, label) {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new TypeError(`${label} is invalid`);
  }
  return value;
}

async function getTaskContract(args) {
  requireObject(args, "arguments");
  requireOnlyKeys(args, ["task_id"], "arguments");
  const taskId = requireIdentifier(args.task_id, /^T[0-9]+-[a-z0-9-]+$/, "task_id");
  const taskRoot = resolve(projectRoot, "benchmark", "tasks", taskId);
  const task = await readJson(resolve(taskRoot, "task.json"));
  const prompt = await readFile(resolve(taskRoot, task.prompt_path), "utf8");
  const rubric = await readJson(resolve(taskRoot, "rubric.json"));

  return {
    task: {
      id: task.id,
      version: task.version,
      title: task.title,
      type: task.type,
      mode: task.mode,
    },
    prompt_sha256: sha256(prompt),
    allowed_paths: task.allowed_paths,
    forbidden_actions: task.forbidden_actions,
    acceptance_checks: task.acceptance_checks,
    visible_commands: task.verification?.visible_commands ?? [],
    hidden_suite: task.verification?.hidden_suite ?? null,
    rubric_total_points: rubric.total_points,
    rubric_criteria: rubric.criteria.map(({ id, points, description }) => ({
      id,
      points,
      description,
    })),
  };
}

function summarizeChecks(checks, kind) {
  const selected = checks.filter((check) => check.kind === kind);
  return {
    total: selected.length,
    passed: selected.filter((check) => check.exit_code === 0 && !check.timed_out).length,
    failed: selected.filter((check) => check.exit_code !== 0 || check.timed_out).length,
    timed_out: selected.filter((check) => check.timed_out).length,
  };
}

async function summarizeRun(args) {
  requireObject(args, "arguments");
  requireOnlyKeys(args, ["run_id"], "arguments");
  const runId = requireIdentifier(
    args.run_id,
    /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/,
    "run_id",
  );
  const runRoot = resolve(projectRoot, "benchmark", "runs", runId);
  const expectedArtifacts = [
    "manifest.json",
    "result.json",
    "changes.json",
    "verification.json",
    "changes.patch",
    "stdout.log",
    "stderr.log",
    "prompt.md",
  ];
  const [manifest, result, changes, verification] = await Promise.all([
    readJson(resolve(runRoot, "manifest.json")),
    readJson(resolve(runRoot, "result.json")),
    readJson(resolve(runRoot, "changes.json")),
    readJson(resolve(runRoot, "verification.json")),
  ]);
  const prompt = await readFile(resolve(runRoot, "prompt.md"), "utf8");
  const checks = Array.isArray(verification.results) ? verification.results : [];

  let currentTaskPromptSha256 = null;
  try {
    const taskRoot = resolve(projectRoot, "benchmark", "tasks", manifest.task.id);
    const task = await readJson(resolve(taskRoot, "task.json"));
    currentTaskPromptSha256 = sha256(await readFile(resolve(taskRoot, task.prompt_path), "utf8"));
  } catch {
    // A historical task may no longer be present. Preserve a null comparison.
  }

  return {
    run_id: runId,
    task: manifest.task,
    assistant: manifest.assistant,
    assistant_version: manifest.assistant_version,
    model: manifest.model,
    access_path: manifest.access_path,
    baseline_git_commit: manifest.repository?.git_commit ?? null,
    dirty_at_start: manifest.repository?.dirty_at_start ?? null,
    status: result.status,
    acceptance_status: result.acceptance_status,
    elapsed_ms: result.elapsed_ms,
    timed_out: result.timed_out,
    human_intervention_limit: manifest.settings?.max_human_interventions ?? null,
    prompt_sha256: sha256(prompt),
    prompt_matches_manifest: sha256(prompt) === manifest.prompt_sha256,
    prompt_matches_current_task: currentTaskPromptSha256 === null
      ? null
      : sha256(prompt) === currentTaskPromptSha256,
    changed_paths: changes.changed_paths ?? result.changed_paths ?? [],
    out_of_scope_paths: changes.out_of_scope_paths ?? [],
    verification: {
      visible: summarizeChecks(checks, "visible"),
      private: summarizeChecks(checks, "private"),
      infrastructure_errors: verification.infrastructure_errors ?? [],
    },
    notes: result.notes ?? [],
    artifacts_present: Object.fromEntries(
      expectedArtifacts.map((name) => [name, existsSync(resolve(runRoot, name))]),
    ),
  };
}

const tools = [
  {
    name: "get_task_contract",
    title: "Get benchmark task contract",
    description: "Return the frozen scope, checks, prompt digest, and rubric for one benchmark task without returning private test contents.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Versioned task directory ID, for example T6-rejected-promise-cache." },
      },
      required: ["task_id"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "summarize_run",
    title: "Summarize saved benchmark run",
    description: "Return normalized manifest, scope, prompt-integrity, artifact, and verification facts for one saved run without returning raw transcripts or hidden tests.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", description: "Exact directory name under benchmark/runs." },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];

function toolResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function toolError(error) {
  const message = error instanceof Error ? error.message : "Unknown tool error";
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

async function callTool(params) {
  const name = params?.name;
  const args = params?.arguments ?? {};
  try {
    if (name === "get_task_contract") return toolResult(await getTaskContract(args));
    if (name === "summarize_run") return toolResult(await summarizeRun(args));
    throw new TypeError("Unknown benchmark-audit tool");
  } catch (error) {
    return toolError(error);
  }
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleMessage(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    sendError(message?.id ?? null, -32600, "Invalid Request");
    return;
  }
  if (!("id" in message)) {
    return;
  }

  if (message.method === "initialize") {
    const requested = message.params?.protocolVersion;
    sendResult(message.id, {
      protocolVersion: SUPPORTED_PROTOCOLS.has(requested) ? requested : LATEST_PROTOCOL,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      instructions: "Use these read-only tools to audit saved coding-assistant benchmark evidence.",
    });
    return;
  }
  if (message.method === "ping") {
    sendResult(message.id, {});
    return;
  }
  if (message.method === "tools/list") {
    sendResult(message.id, { tools });
    return;
  }
  if (message.method === "tools/call") {
    sendResult(message.id, await callTool(message.params));
    return;
  }

  sendError(message.id, -32601, "Method not found");
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", async (line) => {
  if (line.trim() === "") return;
  try {
    await handleMessage(JSON.parse(line));
  } catch {
    sendError(null, -32700, "Parse error");
  }
});
