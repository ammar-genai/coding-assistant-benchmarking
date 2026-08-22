import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vinext",
  ".wrangler",
  "dist",
  "node_modules",
  "runs",
]);

function usage() {
  console.log(`Usage:
  npm run benchmark:run -- --assistant <codex|claude|opencode|pi> [options]

Options:
  --task <id>       Task directory name (default: T1-repo-map)
  --model <id>      Exact model ID. Defaults to the assistant's normal baseline.
  --execute         Execute and record the run. Without this flag, print a preview.
  --help            Show this message.

Examples:
  npm run benchmark:run -- --assistant opencode
  npm run benchmark:run -- --assistant opencode --model ollama/deepseek-v4-flash:cloud --execute`);
}

function parseArgs(argv) {
  const options = { task: "T1-repo-map", execute: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--execute") options.execute = true;
    else if (value === "--help") options.help = true;
    else if (value === "--assistant" || value === "--task" || value === "--model") {
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

function version(command) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? (result.stdout || result.stderr).trim().split("\n")[0] : null;
}

function gitValue(args) {
  const result = spawnSync("git", args, { cwd: projectRoot, encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function ollamaAccessPath(model) {
  if (!model.startsWith("ollama/")) return null;
  return model.endsWith(":cloud") ? "ollama-cloud" : "ollama-local";
}

function snapshotDirectory(root = projectRoot) {
  const files = new Map();

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolutePath = resolve(directory, entry.name);
      const relativePath = relative(root, absolutePath);
      if (relativePath.startsWith("benchmark/runs/")) continue;
      if (entry.isDirectory()) visit(absolutePath);
      else if (entry.isFile() && statSync(absolutePath).size <= 25_000_000) {
        files.set(relativePath, sha256(readFileSync(absolutePath)));
      }
    }
  }

  visit(root);
  return files;
}

function compareSnapshots(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((path) => before.get(path) !== after.get(path))
    .sort();
}

function adapter(assistant, model, prompt) {
  if (assistant === "codex") {
    const args = [
      "exec",
      "--ephemeral",
      "--json",
      "--ignore-user-config",
      "--sandbox",
      "read-only",
      "--cd",
      projectRoot,
    ];
    if (model.startsWith("ollama/")) {
      args.push("--oss", "--local-provider", "ollama", "--model", model.slice("ollama/".length));
    } else if (model !== "subscription-default") args.push("--model", model);
    args.push(prompt);
    return { command: "codex", args, accessPath: ollamaAccessPath(model) ?? "subscription" };
  }

  if (assistant === "claude") {
    const args = [
      "--print",
      "--output-format",
      "stream-json",
      "--verbose",
      "--no-session-persistence",
      "--permission-mode",
      "plan",
      "--tools",
      "Read,Glob,Grep",
    ];
    if (model !== "subscription-default") args.push("--model", model);
    args.push(prompt);
    return { command: "claude", args, accessPath: "subscription" };
  }

  if (assistant === "opencode") {
    const args = ["run", "--format", "json", "--agent", "plan", "--dir", projectRoot, "--model", model, prompt];
    return { command: "opencode", args, accessPath: ollamaAccessPath(model) ?? "unknown" };
  }

  if (assistant === "pi") {
    const args = [
      "--print",
      "--mode",
      "json",
      "--no-session",
      "--no-extensions",
      "--tools",
      "read,grep,find,ls",
      "--model",
      model,
      prompt,
    ];
    return { command: "pi", args, accessPath: ollamaAccessPath(model) ?? "unknown" };
  }

  throw new Error(`Unsupported assistant: ${assistant}`);
}

async function execute(command, args, timeoutMs) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
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
      resolveRun({ exitCode: null, signal: null, timedOut, stdout, stderr: `${stderr}${error.stack ?? error.message}\n` });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolveRun({ exitCode, signal, timedOut, stdout, stderr });
    });
  });
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
  codex: "subscription-default",
  claude: "subscription-default",
  opencode: "ollama/deepseek-v4-flash:cloud",
  pi: "ollama/deepseek-v4-flash:cloud",
};
const model = options.model ?? defaults[options.assistant];
if (!model) throw new Error(`No default model for ${options.assistant}`);

const taskDirectory = resolve(projectRoot, "benchmark", "tasks", options.task);
const task = JSON.parse(readFileSync(resolve(taskDirectory, "task.json"), "utf8"));
const prompt = readFileSync(resolve(taskDirectory, task.prompt_path), "utf8");
const selected = adapter(options.assistant, model, prompt);

if (!options.execute) {
  console.log(JSON.stringify({
    mode: "preview",
    task: `${task.id}@${task.version}`,
    assistant: options.assistant,
    model,
    command: [selected.command, ...selected.args.slice(0, -1), "<prompt.md>"],
    timeout_seconds: task.limits.max_wall_time_seconds,
  }, null, 2));
  process.exit(0);
}

const startedAt = new Date();
const runId = `${startedAt.toISOString().replaceAll(":", "-")}_${options.assistant}_${task.id}`;
const runDirectory = resolve(projectRoot, "benchmark", "runs", runId);
mkdirSync(runDirectory, { recursive: false });

const before = snapshotDirectory();
const gitCommit = gitValue(["rev-parse", "--verify", "HEAD"]);
const manifest = {
  schema_version: "1.0",
  run_id: runId,
  task: { id: task.id, version: task.version },
  assistant: options.assistant,
  assistant_version: version(selected.command),
  model,
  access_path: selected.accessPath,
  repository: {
    path: projectRoot,
    git_commit: gitCommit,
    dirty_at_start: Boolean(gitValue(["status", "--porcelain"])),
  },
  prompt_sha256: sha256(prompt),
  command: [selected.command, ...selected.args.slice(0, -1), "<prompt.md>"],
  started_at: startedAt.toISOString(),
  settings: {
    task_mode: task.mode,
    max_wall_time_seconds: task.limits.max_wall_time_seconds,
    max_human_interventions: task.limits.max_human_interventions,
  },
};

writeFileSync(resolve(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
writeFileSync(resolve(runDirectory, "prompt.md"), prompt, { flag: "wx" });

const outcome = await execute(selected.command, selected.args, task.limits.max_wall_time_seconds * 1000);
const finishedAt = new Date();
const after = snapshotDirectory();
const changedPaths = compareSnapshots(before, after);

writeFileSync(resolve(runDirectory, "stdout.log"), outcome.stdout, { flag: "wx" });
writeFileSync(resolve(runDirectory, "stderr.log"), outcome.stderr, { flag: "wx" });
writeFileSync(resolve(runDirectory, "changes.json"), `${JSON.stringify({ changed_paths: changedPaths }, null, 2)}\n`, { flag: "wx" });

let status = "complete";
if (outcome.timedOut) status = "timeout";
else if (outcome.exitCode !== 0) status = "failed";
const acceptanceStatus = status === "complete"
  ? (task.mode === "read-only" && changedPaths.length > 0 ? "fail" : "pending")
  : "not-graded";

const result = {
  schema_version: "1.0",
  run_id: runId,
  status,
  acceptance_status: acceptanceStatus,
  started_at: startedAt.toISOString(),
  finished_at: finishedAt.toISOString(),
  elapsed_ms: finishedAt.getTime() - startedAt.getTime(),
  exit_code: outcome.exitCode,
  signal: outcome.signal,
  timed_out: outcome.timedOut,
  workspace_changed: changedPaths.length > 0,
  changed_paths: changedPaths,
  artifacts: {
    manifest: "manifest.json",
    prompt: "prompt.md",
    stdout: "stdout.log",
    stderr: "stderr.log",
    changes: "changes.json",
  },
  notes: task.mode === "read-only" && changedPaths.length > 0 ? ["Read-only workspace change caused an automatic failure."] : [],
};

writeFileSync(resolve(runDirectory, "result.json"), `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ run_directory: relative(projectRoot, runDirectory), ...result }, null, 2));
process.exit(status === "complete" && acceptanceStatus !== "fail" ? 0 : 1);
