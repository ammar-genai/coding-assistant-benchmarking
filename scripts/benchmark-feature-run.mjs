import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const featureId = "benchmark-audit-invocation";
const targetRunId = "2026-08-23T18-22-22.767Z_codex_T6-rejected-promise-cache";
const taskId = "T6-rejected-promise-cache";
const promptPath = resolve(projectRoot, "benchmark", "features", featureId, "prompt.md");
const serverPath = resolve(projectRoot, "benchmark", "extensions", "benchmark-audit", "server.mjs");

function usage() {
  console.log(`Usage:
  npm run benchmark:feature -- --assistant <codex|claude|opencode> [options]

Options:
  --model <id>      Exact model ID. Defaults to the preregistered route.
  --execute         Execute and save the raw feature run. Otherwise preview it.
  --help            Show this message.`);
}

function parseArgs(argv) {
  const options = { execute: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--execute") options.execute = true;
    else if (value === "--help") options.help = true;
    else if (value === "--assistant" || value === "--model") {
      const next = argv[index + 1];
      if (!next) throw new Error(`${value} requires a value`);
      options[value.slice(2)] = next;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${value}`);
    }
  }
  return options;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function commandOutput(command, args) {
  const outcome = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 10_000,
  });
  return outcome.status === 0 ? outcome.stdout.trim() : null;
}

function version(command) {
  const outcome = spawnSync(command, ["--version"], {
    encoding: "utf8",
    timeout: 10_000,
  });
  return outcome.status === 0
    ? (outcome.stdout || outcome.stderr).trim().split("\n")[0]
    : null;
}

function mcpCommand() {
  return [process.execPath, serverPath, "--root", projectRoot];
}

function openCodeConfig() {
  return {
    mcp: {
      "benchmark-audit": {
        type: "local",
        command: mcpCommand(),
        enabled: true,
        timeout: 5_000,
      },
    },
    tools: {
      bash: false,
      edit: false,
      write: false,
      read: false,
      grep: false,
      glob: false,
      webfetch: false,
      websearch: false,
    },
    permission: {
      "*": "deny",
      skill: "allow",
      "benchmark-audit_*": "allow",
    },
  };
}

function adapter(assistant, model, prompt) {
  if (assistant === "codex") {
    const mcpArgs = JSON.stringify([serverPath, "--root", projectRoot]);
    return {
      command: "codex",
      args: [
        "exec",
        "--ephemeral",
        "--json",
        "--ignore-user-config",
        "--sandbox",
        "read-only",
        "--cd",
        projectRoot,
        "--model",
        model,
        "-c",
        `mcp_servers.benchmark-audit.command=${JSON.stringify(process.execPath)}`,
        "-c",
        `mcp_servers.benchmark-audit.args=${mcpArgs}`,
        "-c",
        "mcp_servers.benchmark-audit.startup_timeout_sec=5",
        "-c",
        "mcp_servers.benchmark-audit.tool_timeout_sec=10",
        prompt,
      ],
      accessPath: "subscription",
      environment: process.env,
    };
  }

  if (assistant === "claude") {
    const config = JSON.stringify({
      mcpServers: {
        "benchmark-audit": {
          type: "stdio",
          command: process.execPath,
          args: [serverPath, "--root", projectRoot],
        },
      },
    });
    return {
      command: "claude",
      args: [
        "--print",
        "--output-format",
        "stream-json",
        "--verbose",
        "--no-session-persistence",
        "--setting-sources",
        "project",
        "--permission-mode",
        "dontAsk",
        "--strict-mcp-config",
        "--mcp-config",
        config,
        "--tools",
        "Skill,mcp__benchmark-audit__get_task_contract,mcp__benchmark-audit__summarize_run",
        "--model",
        model,
        "--",
        prompt,
      ],
      accessPath: "subscription",
      environment: process.env,
    };
  }

  if (assistant === "opencode") {
    return {
      command: "opencode",
      args: [
        "run",
        "--pure",
        "--format",
        "json",
        "--agent",
        "plan",
        "--dir",
        projectRoot,
        "--model",
        model,
        prompt,
      ],
      accessPath: model.startsWith("ollama/") && model.endsWith(":cloud")
        ? "ollama-cloud"
        : "unknown",
      environment: {
        ...process.env,
        OPENCODE_CONFIG_CONTENT: JSON.stringify(openCodeConfig()),
      },
    };
  }

  throw new Error(`Unsupported assistant: ${assistant}`);
}

async function execute(command, args, environment, timeoutMs) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolveRun({
        exitCode: null,
        signal: null,
        timedOut,
        stdout,
        stderr: `${stderr}${error.stack ?? error.message}\n`,
      });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolveRun({ exitCode, signal, timedOut, stdout, stderr });
    });
  });
}

function parseEvents(stdout) {
  return stdout.split("\n").filter(Boolean).flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
}

function normalizeToolName(value) {
  return typeof value === "string" ? value : "unknown";
}

function summarizeEvents(assistant, events) {
  const toolCalls = [];
  let finalResponse = "";
  let usage = null;
  let subscriptionTelemetryUsd = null;

  if (assistant === "codex") {
    for (const event of events) {
      if (event.type === "item.completed" && event.item?.type === "mcp_tool_call") {
        toolCalls.push(normalizeToolName(event.item.tool ?? event.item.name));
      }
      if (event.type === "item.completed" && event.item?.type === "agent_message") {
        finalResponse = event.item.text ?? "";
      }
      if (event.type === "turn.completed") usage = event.usage ?? null;
    }
  } else if (assistant === "claude") {
    for (const event of events) {
      for (const content of event.message?.content ?? []) {
        if (content.type === "tool_use") toolCalls.push(normalizeToolName(content.name));
      }
      if (event.type === "result") {
        finalResponse = event.result ?? finalResponse;
        usage = event.usage ?? null;
        subscriptionTelemetryUsd = event.total_cost_usd ?? null;
      }
    }
  } else if (assistant === "opencode") {
    const stepUsage = [];
    for (const event of events) {
      if (event.type === "tool_use") toolCalls.push(normalizeToolName(event.part?.tool));
      if (event.type === "text") finalResponse += event.part?.text ?? "";
      if (event.type === "step_finish" && event.part?.tokens) {
        stepUsage.push({ tokens: event.part.tokens, cost: event.part.cost ?? null });
      }
    }
    usage = { steps: stepUsage };
  }

  const requiredCalls = {
    get_task_contract: toolCalls.filter((name) => name.includes("get_task_contract")).length,
    summarize_run: toolCalls.filter((name) => name.includes("summarize_run")).length,
  };
  const allowedCalls = toolCalls.filter((name) => (
    name.includes("get_task_contract")
    || name.includes("summarize_run")
    || name.toLowerCase() === "skill"
  ));
  const headings = ["Verdict", "Evidence", "Telemetry", "Limitations"].filter(
    (heading) => new RegExp(`^## ${heading}$`, "m").test(finalResponse),
  );

  return {
    tool_calls: toolCalls,
    required_tool_call_counts: requiredCalls,
    unexpected_tool_calls: toolCalls.filter((name) => !allowedCalls.includes(name)),
    final_response: finalResponse,
    required_headings_present: headings,
    usage,
    subscription_cli_telemetry_usd: subscriptionTelemetryUsd,
  };
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  usage();
  process.exit(0);
}
if (!options.assistant) {
  usage();
  throw new Error("--assistant is required");
}

const defaults = {
  codex: "gpt-5.6-sol",
  claude: "claude-opus-5",
  opencode: "ollama/kimi-k2.7-code:cloud",
};
const model = options.model ?? defaults[options.assistant];
if (!model) throw new Error(`No default model for ${options.assistant}`);
const prompt = readFileSync(promptPath, "utf8");
const selected = adapter(options.assistant, model, prompt);

if (!options.execute) {
  console.log(JSON.stringify({
    mode: "preview",
    feature: featureId,
    assistant: options.assistant,
    model,
    access_path: selected.accessPath,
    prompt_sha256: sha256(prompt),
    target_run_id: targetRunId,
    command: [selected.command, ...selected.args.slice(0, -1), "<prompt.md>"],
  }, null, 2));
  process.exit(0);
}

const gitCommit = commandOutput("git", ["rev-parse", "--verify", "HEAD"]);
if (!gitCommit) throw new Error("A Git baseline is required.");
const statusBefore = commandOutput("git", ["status", "--porcelain"]);
if (statusBefore) throw new Error("Commit or restore workspace changes before a feature run.");

const targetManifestPath = resolve(projectRoot, "benchmark", "runs", targetRunId, "manifest.json");
const targetManifest = JSON.parse(readFileSync(targetManifestPath, "utf8"));
if (targetManifest.task?.id !== taskId) throw new Error("Target run task does not match the pilot.");

const createdAt = new Date();
const runId = `${createdAt.toISOString().replaceAll(":", "-")}_${options.assistant}_${featureId}`;
const runDirectory = resolve(projectRoot, "benchmark", "feature-runs", runId);
mkdirSync(runDirectory, { recursive: false });
const manifest = {
  schema_version: "1.0",
  run_id: runId,
  feature: featureId,
  assistant: options.assistant,
  assistant_version: version({ codex: "codex", claude: "claude", opencode: "opencode" }[options.assistant]),
  model,
  access_path: selected.accessPath,
  git_commit: gitCommit,
  prompt_sha256: sha256(prompt),
  target_run_id: targetRunId,
  target_task_id: taskId,
  max_wall_time_seconds: 600,
  max_human_interventions: 0,
  started_at: createdAt.toISOString(),
};
writeFileSync(resolve(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(resolve(runDirectory, "prompt.md"), prompt);

const outcome = await execute(selected.command, selected.args, selected.environment, 600_000);
const finishedAt = new Date();
const statusAfter = commandOutput("git", ["status", "--porcelain"]);
const events = parseEvents(outcome.stdout);
const summary = summarizeEvents(options.assistant, events);
const status = outcome.timedOut ? "timeout" : outcome.exitCode === 0 ? "complete" : "failed";
const automaticChecks = {
  process_complete: status === "complete",
  workspace_unchanged: !statusAfter,
  get_task_contract_once: summary.required_tool_call_counts.get_task_contract === 1,
  summarize_run_once: summary.required_tool_call_counts.summarize_run === 1,
  no_unexpected_tools: summary.unexpected_tool_calls.length === 0,
  four_required_headings: summary.required_headings_present.length === 4,
};
const result = {
  schema_version: "1.0",
  run_id: runId,
  status,
  acceptance_status: Object.values(automaticChecks).every(Boolean) ? "pass" : "fail",
  started_at: createdAt.toISOString(),
  finished_at: finishedAt.toISOString(),
  elapsed_ms: finishedAt.getTime() - createdAt.getTime(),
  exit_code: outcome.exitCode,
  signal: outcome.signal,
  timed_out: outcome.timedOut,
  automatic_checks: automaticChecks,
  ...summary,
};
writeFileSync(resolve(runDirectory, "stdout.log"), outcome.stdout);
writeFileSync(resolve(runDirectory, "stderr.log"), outcome.stderr);
writeFileSync(resolve(runDirectory, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  run_directory: relative(projectRoot, runDirectory),
  ...result,
  final_response: result.final_response ? "<saved in result.json>" : "",
}, null, 2));
process.exit(result.acceptance_status === "pass" ? 0 : 1);
