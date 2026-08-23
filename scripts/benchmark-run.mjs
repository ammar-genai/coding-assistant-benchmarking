import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

function gitValue(args, workingDirectory = projectRoot) {
  const result = spawnSync("git", args, { cwd: workingDirectory, encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

function gitOutput(args, workingDirectory = projectRoot) {
  const result = spawnSync("git", args, { cwd: workingDirectory, encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? result.stdout : null;
}

function createIsolatedWorktree(commit) {
  const container = mkdtempSync(resolve(tmpdir(), "coding-assistant-benchmark-"));
  const checkout = resolve(container, "checkout");
  const result = spawnSync("git", ["worktree", "add", "--detach", checkout, commit], {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (result.status !== 0) {
    rmdirSync(container);
    throw new Error(`Could not create isolated worktree: ${result.stderr || result.stdout}`);
  }
  return { container, checkout };
}

function removeIsolatedWorktree({ container, checkout }) {
  const result = spawnSync("git", ["worktree", "remove", "--force", checkout], {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (result.status === 0) rmdirSync(container);
  return result.status === 0 ? null : (result.stderr || result.stdout || "Unknown worktree cleanup error").trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function modelAccessPath(model) {
  if (model.startsWith("ollama/")) {
    return model.endsWith(":cloud") ? "ollama-cloud" : "ollama-local";
  }
  if (model.startsWith("openrouter/")) return "api";
  return null;
}

function snapshotDirectory(root = projectRoot) {
  const files = new Map();

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
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

function pathIsAllowed(changedPath, allowedPaths) {
  const normalizedPath = changedPath.replaceAll("\\", "/");
  return allowedPaths.some((pattern) => {
    const normalizedPattern = pattern.replaceAll("\\", "/");
    if (normalizedPattern === "**/*" || normalizedPattern === "*") return true;
    if (normalizedPattern.endsWith("/**")) {
      return normalizedPath.startsWith(normalizedPattern.slice(0, -2));
    }
    return normalizedPath === normalizedPattern;
  });
}

function openCodePermissions(task) {
  const readOnly = task.mode === "read-only";
  const editRules = { "*": "deny" };
  const bashRules = { "*": "deny" };

  if (!readOnly) {
    for (const allowedPath of task.allowed_paths) {
      editRules[allowedPath === "**/*" ? "*" : allowedPath] = "allow";
    }
    for (const command of task.verification?.visible_commands ?? []) {
      bashRules[command] = "allow";
    }
  }

  return {
    permission: {
      "*": "deny",
      read: "allow",
      glob: "allow",
      grep: "allow",
      lsp: "allow",
      edit: editRules,
      bash: bashRules,
      task: "deny",
      question: "deny",
      webfetch: "deny",
      websearch: "deny",
      external_directory: "deny",
    },
  };
}

function adapter(assistant, model, prompt, targetRoot, task) {
  if (assistant === "codex") {
    const args = [
      "exec",
      "--ephemeral",
      "--json",
      "--ignore-user-config",
      "--sandbox",
      task.mode === "workspace-write" ? "workspace-write" : "read-only",
      "--cd",
      targetRoot,
    ];
    if (model.startsWith("ollama/")) {
      args.push("--oss", "--local-provider", "ollama", "--model", model.slice("ollama/".length));
    } else if (model !== "subscription-default") args.push("--model", model);
    args.push(prompt);
    return { command: "codex", args, accessPath: modelAccessPath(model) ?? "subscription" };
  }

  if (assistant === "claude") {
    const writeMode = task.mode === "workspace-write";
    const claudeArgs = [
      "--print",
      "--output-format",
      "stream-json",
      "--verbose",
      "--no-session-persistence",
      "--setting-sources",
      "project",
      "--permission-mode",
      writeMode ? "acceptEdits" : "plan",
      "--tools",
      writeMode ? "Read,Glob,Grep,Edit,Write,Bash" : "Read,Glob,Grep",
    ];
    if (writeMode && task.verification?.visible_commands?.length > 0) {
      claudeArgs.push(
        "--allowedTools",
        ...task.verification.visible_commands.map((command) => `Bash(${command})`),
      );
    }
    if (model.startsWith("ollama/")) {
      const args = [
        "launch",
        "claude",
        "--model",
        model.slice("ollama/".length),
        "--yes",
        "--",
        ...claudeArgs,
        "--",
        prompt,
      ];
      return { command: "ollama", args, accessPath: modelAccessPath(model) };
    }
    if (model !== "subscription-default") claudeArgs.push("--model", model);
    claudeArgs.push("--", prompt);
    return { command: "claude", args: claudeArgs, accessPath: "subscription" };
  }

  if (assistant === "opencode") {
    const args = [
      "run",
      "--pure",
      "--format",
      "json",
      "--agent",
      task.mode === "workspace-write" ? "build" : "plan",
      "--dir",
      targetRoot,
      "--model",
      model,
      prompt,
    ];
    return {
      command: "opencode",
      args,
      accessPath: modelAccessPath(model) ?? "unknown",
      env: {
        ...process.env,
        OPENCODE_CONFIG_CONTENT: JSON.stringify(openCodePermissions(task)),
      },
    };
  }

  if (assistant === "pi") {
    const piArgs = [
      "--print",
      "--mode",
      "json",
      "--no-session",
      "--no-extensions",
      "--no-skills",
      "--no-prompt-templates",
      "--no-themes",
      "--approve",
      "--tools",
      task.mode === "workspace-write" ? "read,grep,find,ls,edit,write,bash" : "read,grep,find,ls",
    ];
    if (model.startsWith("ollama/")) {
      const args = [
        "launch",
        "pi",
        "--model",
        model.slice("ollama/".length),
        "--yes",
        "--",
        ...piArgs,
        prompt,
      ];
      return { command: "ollama", args, accessPath: modelAccessPath(model) };
    }
    piArgs.push("--model", model, prompt);
    return { command: "pi", args: piArgs, accessPath: "unknown" };
  }

  throw new Error(`Unsupported assistant: ${assistant}`);
}

async function execute(command, args, timeoutMs, workingDirectory, environment = process.env) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: workingDirectory,
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
      resolveRun({ exitCode: null, signal: null, timedOut, stdout, stderr: `${stderr}${error.stack ?? error.message}\n` });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolveRun({ exitCode, signal, timedOut, stdout, stderr });
    });
  });
}

async function runVerification(task, targetRoot) {
  const results = [];
  const infrastructureErrors = [];
  const timeoutMs = task.limits.max_wall_time_seconds * 1000;

  for (const [index, command] of (task.verification?.visible_commands ?? []).entries()) {
    const startedAt = Date.now();
    const outcome = await execute("/bin/sh", ["-lc", command], timeoutMs, targetRoot);
    results.push({
      id: `visible-${index + 1}`,
      kind: "visible",
      command,
      elapsed_ms: Date.now() - startedAt,
      exit_code: outcome.exitCode,
      signal: outcome.signal,
      timed_out: outcome.timedOut,
      stdout: outcome.stdout,
      stderr: outcome.stderr,
    });
  }

  if (task.verification?.hidden_suite) {
    const hiddenPath = resolve(projectRoot, "benchmark", "private", `${task.verification.hidden_suite}.test.mjs`);
    if (!existsSync(hiddenPath)) {
      infrastructureErrors.push(`Private suite is missing: ${task.verification.hidden_suite}`);
    } else if (sha256(readFileSync(hiddenPath)) !== task.verification.hidden_sha256) {
      infrastructureErrors.push(`Private suite hash does not match the task contract: ${task.verification.hidden_suite}`);
    } else {
      const startedAt = Date.now();
      const outcome = await execute(
        process.execPath,
        ["--test", hiddenPath],
        timeoutMs,
        targetRoot,
        { ...process.env, BENCHMARK_TARGET_ROOT: targetRoot },
      );
      results.push({
        id: "private-1",
        kind: "private",
        command: `[private suite: ${task.verification.hidden_suite}]`,
        elapsed_ms: Date.now() - startedAt,
        exit_code: outcome.exitCode,
        signal: outcome.signal,
        timed_out: outcome.timedOut,
        stdout: outcome.stdout,
        stderr: outcome.stderr,
      });
    }
  }

  return { results, infrastructure_errors: infrastructureErrors };
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

if (!options.execute) {
  const selected = adapter(options.assistant, model, prompt, "<isolated-worktree>", task);
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

const createdAt = new Date();
const runId = `${createdAt.toISOString().replaceAll(":", "-")}_${options.assistant}_${task.id}`;
const runDirectory = resolve(projectRoot, "benchmark", "runs", runId);
mkdirSync(runDirectory, { recursive: false });

const gitCommit = gitValue(["rev-parse", "--verify", "HEAD"]);
if (!gitCommit) throw new Error("A baseline Git commit is required before executing a benchmark.");
const trackedChanges = gitValue(["status", "--porcelain", "--untracked-files=no"]);
if (trackedChanges) throw new Error("Commit or restore tracked workspace changes before executing a benchmark.");

const isolatedWorktree = createIsolatedWorktree(gitCommit);
const targetRoot = isolatedWorktree.checkout;
const selected = adapter(options.assistant, model, prompt, targetRoot, task);
const before = snapshotDirectory(targetRoot);
const startedAt = new Date();
const manifest = {
  schema_version: "1.0",
  run_id: runId,
  task: { id: task.id, version: task.version },
  assistant: options.assistant,
  assistant_version: version({ codex: "codex", claude: "claude", opencode: "opencode", pi: "pi" }[options.assistant]),
  model,
  access_path: selected.accessPath,
  repository: {
    path: targetRoot,
    git_commit: gitCommit,
    dirty_at_start: Boolean(gitValue(["status", "--porcelain"], targetRoot)),
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

const outcome = await execute(
  selected.command,
  selected.args,
  task.limits.max_wall_time_seconds * 1000,
  targetRoot,
  selected.env,
);
const finishedAt = new Date();
let status = "complete";
if (outcome.timedOut) status = "timeout";
else if (outcome.exitCode !== 0) status = "failed";

const verification = status === "complete" && task.mode === "workspace-write"
  ? await runVerification(task, targetRoot)
  : { results: [], infrastructure_errors: [] };
const after = snapshotDirectory(targetRoot);
const changedPaths = compareSnapshots(before, after);
const outOfScopePaths = changedPaths.filter((changedPath) => !pathIsAllowed(changedPath, task.allowed_paths));
const patch = gitOutput(["diff", "--binary", "--no-ext-diff", "HEAD"], targetRoot) ?? "";
const cleanupError = removeIsolatedWorktree(isolatedWorktree);

writeFileSync(resolve(runDirectory, "stdout.log"), outcome.stdout, { flag: "wx" });
writeFileSync(resolve(runDirectory, "stderr.log"), outcome.stderr, { flag: "wx" });
writeFileSync(resolve(runDirectory, "changes.json"), `${JSON.stringify({
  changed_paths: changedPaths,
  out_of_scope_paths: outOfScopePaths,
}, null, 2)}\n`, { flag: "wx" });
writeFileSync(resolve(runDirectory, "changes.patch"), patch, { flag: "wx" });
writeFileSync(resolve(runDirectory, "verification.json"), `${JSON.stringify(verification, null, 2)}\n`, { flag: "wx" });

let acceptanceStatus = "not-graded";
if (status === "complete" && task.mode === "read-only") {
  acceptanceStatus = changedPaths.length > 0 ? "fail" : "pending";
} else if (status === "complete" && task.mode === "workspace-write") {
  if (verification.infrastructure_errors.length > 0 || !task.verification) {
    acceptanceStatus = "invalid";
  } else {
    const checksPassed = verification.results.length > 0 && verification.results.every(
      (check) => check.exit_code === 0 && !check.timed_out,
    );
    acceptanceStatus = changedPaths.length > 0 && outOfScopePaths.length === 0 && checksPassed
      ? "pass"
      : "fail";
  }
}

const notes = [];
if (task.mode === "read-only" && changedPaths.length > 0) notes.push("Read-only workspace change caused an automatic failure.");
if (task.mode === "workspace-write" && changedPaths.length === 0) notes.push("The assistant did not change the workspace.");
if (outOfScopePaths.length > 0) notes.push(`Out-of-scope changes: ${outOfScopePaths.join(", ")}`);
if (verification.results.some((check) => check.exit_code !== 0 || check.timed_out)) notes.push("One or more verification checks failed.");
notes.push(...verification.infrastructure_errors);
if (cleanupError) notes.push(`Temporary worktree cleanup failed: ${cleanupError}`);

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
    patch: "changes.patch",
    verification: "verification.json",
  },
  notes,
};

writeFileSync(resolve(runDirectory, "result.json"), `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify({ run_directory: relative(projectRoot, runDirectory), ...result }, null, 2));
process.exit(status === "complete" && acceptanceStatus !== "fail" ? 0 : 1);
