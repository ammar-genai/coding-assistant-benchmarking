import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
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
  npm run benchmark:workflow -- [options]

Options:
  --task <id>              Task directory name (default: T5-review-queue)
  --planner-model <id>     Codex planning model (default: gpt-5.6-sol)
  --reviewer-model <id>    Claude review model (default: claude-opus-5)
  --worker-model <id>      OpenCode worker model (default: openrouter/moonshotai/kimi-k3)
  --execute                 Execute and record the workflow. Otherwise print a preview.
  --help                    Show this message.`);
}

function parseArgs(argv) {
  const options = {
    task: "T5-review-queue",
    plannerModel: "gpt-5.6-sol",
    reviewerModel: "claude-opus-5",
    workerModel: "openrouter/moonshotai/kimi-k3",
    execute: false,
  };
  const valueOptions = new Map([
    ["--task", "task"],
    ["--planner-model", "plannerModel"],
    ["--reviewer-model", "reviewerModel"],
    ["--worker-model", "workerModel"],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--execute") options.execute = true;
    else if (value === "--help") options.help = true;
    else if (valueOptions.has(value)) {
      const next = argv[index + 1];
      if (!next) throw new Error(`${value} requires a value`);
      options[valueOptions.get(value)] = next;
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

function version(command) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 10_000 });
  return result.status === 0 ? (result.stdout || result.stderr).trim().split("\n")[0] : null;
}

function gitValue(args, cwd = projectRoot) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 20_000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

function gitOutput(args, cwd = projectRoot) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 20_000 });
  return result.status === 0 ? result.stdout : null;
}

function createIsolatedWorktree(commit) {
  const container = mkdtempSync(resolve(tmpdir(), "coding-assistant-workflow-"));
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
  return result.status === 0 ? null : (result.stderr || result.stdout || "Unknown cleanup error").trim();
}

function snapshotDirectory(root) {
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

async function execute(command, args, timeoutMs, cwd, environment = process.env) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const startedAt = Date.now();
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
        elapsedMs: Date.now() - startedAt,
      });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolveRun({
        exitCode,
        signal,
        timedOut,
        stdout,
        stderr,
        elapsedMs: Date.now() - startedAt,
      });
    });
  });
}

function parseJsonLines(output) {
  return output.split("\n").flatMap((line) => {
    if (!line.trim()) return [];
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
}

function summarizeCodex(outcome) {
  const events = parseJsonLines(outcome.stdout);
  const messages = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item.text)
    .filter(Boolean);
  const usage = [...events].reverse().find((event) => event.type === "turn.completed")?.usage ?? null;
  const tools = {};
  const toolIds = new Set();
  for (const event of events) {
    if (!event.item?.id || toolIds.has(event.item.id)) continue;
    if (["command_execution", "file_change", "mcp_tool_call"].includes(event.item.type)) {
      toolIds.add(event.item.id);
      tools[event.item.type] = (tools[event.item.type] ?? 0) + 1;
    }
  }
  return { final_text: messages.at(-1) ?? "", usage, tool_calls: tools };
}

function summarizeClaude(outcome) {
  const events = parseJsonLines(outcome.stdout);
  const result = [...events].reverse().find((event) => event.type === "result") ?? null;
  const assistantText = events.flatMap((event) => {
    if (event.type !== "assistant") return [];
    return (event.message?.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => part.text);
  });
  return {
    final_text: result?.result ?? assistantText.at(-1) ?? "",
    usage: result?.usage ?? null,
    model_usage: result?.modelUsage ?? null,
    reported_cost_usd: result?.total_cost_usd ?? null,
    permission_denials: result?.permission_denials ?? [],
  };
}

function summarizeOpenCode(outcome, stageStartedAt) {
  const events = parseJsonLines(outcome.stdout);
  const textParts = events
    .filter((event) => event.type === "text" && event.part?.text)
    .map((event) => event.part.text);
  const toolCalls = {};
  let firstEditAt = null;
  for (const event of events) {
    if (event.type !== "tool_use" || !event.part?.tool) continue;
    const tool = event.part.tool;
    toolCalls[tool] = (toolCalls[tool] ?? 0) + 1;
    if (firstEditAt === null && ["edit", "write", "patch"].includes(tool)) {
      firstEditAt = event.part.state?.time?.start ?? event.timestamp ?? null;
    }
  }
  const finishes = events.filter((event) => event.type === "step_finish" && event.part?.tokens);
  const usage = finishes.reduce((total, event) => ({
    input_tokens: total.input_tokens + (event.part.tokens.input ?? 0),
    output_tokens: total.output_tokens + (event.part.tokens.output ?? 0),
    reasoning_tokens: total.reasoning_tokens + (event.part.tokens.reasoning ?? 0),
    cache_read_tokens: total.cache_read_tokens + (event.part.tokens.cache?.read ?? 0),
    cache_write_tokens: total.cache_write_tokens + (event.part.tokens.cache?.write ?? 0),
    total_tokens: total.total_tokens + (event.part.tokens.total ?? 0),
  }), {
    input_tokens: 0,
    output_tokens: 0,
    reasoning_tokens: 0,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    total_tokens: 0,
  });
  const reportedCost = finishes.reduce((total, event) => total + (event.part.cost ?? 0), 0);
  return {
    final_text: textParts.at(-1) ?? "",
    usage,
    reported_cost_usd: Number(reportedCost.toFixed(8)),
    tool_calls: toolCalls,
    time_to_first_edit_ms: firstEditAt === null ? null : Math.max(0, firstEditAt - stageStartedAt),
  };
}

function statusFor(outcome) {
  if (outcome.timedOut) return "timeout";
  return outcome.exitCode === 0 ? "complete" : "failed";
}

function codexCommand(model, cwd, prompt, mode) {
  return {
    command: "codex",
    args: [
      "exec",
      "--ephemeral",
      "--json",
      "--ignore-user-config",
      "--sandbox",
      mode,
      "--cd",
      cwd,
      "--model",
      model,
      prompt,
    ],
  };
}

function claudeCommand(model, prompt, { allowVisibleCommand = null } = {}) {
  const args = [
    "--print",
    "--output-format",
    "stream-json",
    "--verbose",
    "--no-session-persistence",
    "--setting-sources",
    "project",
    "--permission-mode",
    "plan",
    "--tools",
    allowVisibleCommand ? "Read,Glob,Grep,Bash" : "Read,Glob,Grep",
  ];
  if (allowVisibleCommand) args.push("--allowedTools", `Bash(${allowVisibleCommand})`);
  if (model !== "subscription-default") args.push("--model", model);
  args.push("--", prompt);
  return { command: "claude", args };
}

function openCodePermissions(task) {
  const editRules = { "*": "deny" };
  const bashRules = { "*": "deny" };
  for (const allowedPath of task.allowed_paths) editRules[allowedPath] = "allow";
  for (const command of task.verification.visible_commands) bashRules[command] = "allow";
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

function openCodeCommand(model, cwd, prompt, task) {
  return {
    command: "opencode",
    args: [
      "run",
      "--pure",
      "--format",
      "json",
      "--agent",
      "build",
      "--dir",
      cwd,
      "--model",
      model,
      prompt,
    ],
    environment: {
      ...process.env,
      OPENCODE_CONFIG_CONTENT: JSON.stringify(openCodePermissions(task)),
    },
  };
}

async function runChecks(task, cwd, includePrivate) {
  const checks = [];
  const infrastructureErrors = [];
  for (const [index, command] of task.verification.visible_commands.entries()) {
    const outcome = await execute("/bin/sh", ["-lc", command], 60_000, cwd);
    checks.push({
      id: `visible-${index + 1}`,
      kind: "visible",
      command,
      status: statusFor(outcome),
      elapsed_ms: outcome.elapsedMs,
      exit_code: outcome.exitCode,
      signal: outcome.signal,
      timed_out: outcome.timedOut,
      stdout: outcome.stdout,
      stderr: outcome.stderr,
    });
  }

  if (includePrivate) {
    const privatePath = resolve(projectRoot, "benchmark", "private", `${task.verification.hidden_suite}.test.mjs`);
    if (!existsSync(privatePath)) {
      infrastructureErrors.push(`Private suite is missing: ${task.verification.hidden_suite}`);
    } else if (sha256(readFileSync(privatePath)) !== task.verification.hidden_sha256) {
      infrastructureErrors.push(`Private suite hash mismatch: ${task.verification.hidden_suite}`);
    } else {
      const outcome = await execute(
        process.execPath,
        ["--test", privatePath],
        60_000,
        cwd,
        { ...process.env, BENCHMARK_TARGET_ROOT: cwd },
      );
      checks.push({
        id: "private-1",
        kind: "private",
        command: `[private suite: ${task.verification.hidden_suite}]`,
        status: statusFor(outcome),
        elapsed_ms: outcome.elapsedMs,
        exit_code: outcome.exitCode,
        signal: outcome.signal,
        timed_out: outcome.timedOut,
        stdout: outcome.stdout,
        stderr: outcome.stderr,
      });
    }
  }
  return { checks, infrastructure_errors: infrastructureErrors };
}

function saveStage(runDirectory, prefix, prompt, outcome, summary, changedPaths) {
  writeFileSync(resolve(runDirectory, `${prefix}.prompt.md`), prompt, { flag: "wx" });
  writeFileSync(resolve(runDirectory, `${prefix}.stdout.log`), outcome.stdout, { flag: "wx" });
  writeFileSync(resolve(runDirectory, `${prefix}.stderr.log`), outcome.stderr, { flag: "wx" });
  writeFileSync(resolve(runDirectory, `${prefix}.json`), `${JSON.stringify({
    status: statusFor(outcome),
    elapsed_ms: outcome.elapsedMs,
    exit_code: outcome.exitCode,
    signal: outcome.signal,
    timed_out: outcome.timedOut,
    changed_paths_during_stage: changedPaths,
    ...summary,
  }, null, 2)}\n`, { flag: "wx" });
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  usage();
  process.exit(0);
}

const taskDirectory = resolve(projectRoot, "benchmark", "tasks", options.task);
const task = JSON.parse(readFileSync(resolve(taskDirectory, "task.json"), "utf8"));
const taskPrompt = readFileSync(resolve(taskDirectory, task.prompt_path), "utf8");
const visibleCommand = task.verification.visible_commands[0];

const preview = {
  mode: options.execute ? "execute" : "preview",
  task: `${task.id}@${task.version}`,
  workflow: [
    { order: 1, assistant: "codex", model: options.plannerModel, role: "read-only lead planner", timeout_seconds: 600 },
    { order: 2, assistant: "claude", model: options.reviewerModel, role: "read-only plan reviewer", timeout_seconds: 600 },
    { order: 3, assistant: "opencode", model: options.workerModel, role: "implementation worker", timeout_seconds: task.limits.max_wall_time_seconds },
    { order: 4, assistant: "codex", model: options.plannerModel, role: "integration lead", timeout_seconds: 900 },
    { order: 5, assistant: "claude", model: options.reviewerModel, role: "read-only final reviewer", timeout_seconds: 600 },
    { order: 6, assistant: "private harness", model: null, role: "visible and private grader", timeout_seconds: 120 },
  ],
  prompt_sha256: sha256(taskPrompt),
  allowed_paths: task.allowed_paths,
};

if (!options.execute) {
  console.log(JSON.stringify(preview, null, 2));
  process.exit(0);
}

const baselineCommit = gitValue(["rev-parse", "--verify", "HEAD"]);
if (!baselineCommit) throw new Error("A baseline Git commit is required.");
if (gitValue(["status", "--porcelain", "--untracked-files=no"])) {
  throw new Error("Commit or restore tracked workspace changes before executing a workflow.");
}

const createdAt = new Date();
const runId = `${createdAt.toISOString().replaceAll(":", "-")}_distributed_${task.id}`;
const runDirectory = resolve(projectRoot, "benchmark", "runs", runId);
mkdirSync(runDirectory, { recursive: false });
const worktree = createIsolatedWorktree(baselineCommit);
const initialSnapshot = snapshotDirectory(worktree.checkout);
const stageResults = [];
let cleanupError = null;
let workflowError = null;

const manifest = {
  schema_version: "1.0",
  run_id: runId,
  task: { id: task.id, version: task.version },
  baseline_git_commit: baselineCommit,
  prompt_sha256: sha256(taskPrompt),
  started_at: createdAt.toISOString(),
  assistants: {
    codex: { version: version("codex"), model: options.plannerModel, access_path: "subscription" },
    claude: { version: version("claude"), model: options.reviewerModel, access_path: "subscription" },
    opencode: { version: version("opencode"), model: options.workerModel, access_path: "api" },
  },
  policy: {
    max_human_interventions: 0,
    preserve_failures: true,
    private_tests_visible_to_assistants: false,
    allowed_paths: task.allowed_paths,
    stage_order: preview.workflow,
  },
};
writeFileSync(resolve(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
writeFileSync(resolve(runDirectory, "task-prompt.md"), taskPrompt, { flag: "wx" });

try {
  const plannerPrompt = `${taskPrompt}\n\n---\n\n# Your role: lead planner\n\nDo not edit any file. Inspect the repository and return a concrete implementation plan of at most 1,200 words. Cover module responsibilities, exact cross-layer data and error contracts, implementation order, high-risk edge cases, file ownership, and the visible tests the worker must run. Do not claim access to private tests.`;
  const beforePlanner = snapshotDirectory(worktree.checkout);
  const plannerCommand = codexCommand(options.plannerModel, worktree.checkout, plannerPrompt, "read-only");
  const plannerOutcome = await execute(plannerCommand.command, plannerCommand.args, 600_000, worktree.checkout);
  const plannerSummary = summarizeCodex(plannerOutcome);
  const plannerChanges = compareSnapshots(beforePlanner, snapshotDirectory(worktree.checkout));
  saveStage(runDirectory, "01-codex-plan", plannerPrompt, plannerOutcome, plannerSummary, plannerChanges);
  writeFileSync(resolve(runDirectory, "lead-plan.md"), plannerSummary.final_text, { flag: "wx" });
  stageResults.push({ stage: "codex-plan", status: statusFor(plannerOutcome), elapsed_ms: plannerOutcome.elapsedMs, read_only_changes: plannerChanges });
  if (statusFor(plannerOutcome) !== "complete" || plannerChanges.length > 0 || !plannerSummary.final_text) {
    throw new Error("Lead planning stage did not complete cleanly; paid worker stage was not started.");
  }

  const planReviewPrompt = `${taskPrompt}\n\n---\n\n# Lead plan to review\n\n${plannerSummary.final_text}\n\n---\n\n# Your role: pre-implementation plan reviewer\n\nDo not edit any file. Find cross-layer mismatches, missing validation or safety cases, and test gaps. Return a compact corrected plan of at most 900 words with exactly these headings: Blocking gaps, Corrected contract decisions, Worker checklist. If there are no blocking gaps, write "No blocking gaps" under that heading. The implementation worker will receive your review. Do not claim access to private tests.`;
  const beforePlanReview = snapshotDirectory(worktree.checkout);
  const reviewCommand = claudeCommand(options.reviewerModel, planReviewPrompt);
  const reviewOutcome = await execute(reviewCommand.command, reviewCommand.args, 600_000, worktree.checkout);
  const reviewSummary = summarizeClaude(reviewOutcome);
  const planReviewChanges = compareSnapshots(beforePlanReview, snapshotDirectory(worktree.checkout));
  saveStage(runDirectory, "02-claude-plan-review", planReviewPrompt, reviewOutcome, reviewSummary, planReviewChanges);
  writeFileSync(resolve(runDirectory, "plan-review.md"), reviewSummary.final_text, { flag: "wx" });
  stageResults.push({ stage: "claude-plan-review", status: statusFor(reviewOutcome), elapsed_ms: reviewOutcome.elapsedMs, read_only_changes: planReviewChanges });
  if (statusFor(reviewOutcome) !== "complete" || planReviewChanges.length > 0 || !reviewSummary.final_text) {
    throw new Error("Plan-review stage did not complete cleanly; paid worker stage was not started.");
  }

  const workerPrompt = `${taskPrompt}\n\n---\n\n# Approved lead plan\n\n${plannerSummary.final_text}\n\n---\n\n# Independent plan review\n\n${reviewSummary.final_text}\n\n---\n\n# Your role: implementation worker\n\nImplement the frozen task now. Stay inside the five owned files, reconcile the two planning documents with the task contract, add meaningful tests, run the visible command, and provide a concise evidence-based final response. The task contract wins if any planning note conflicts with it. Do not use the network, install dependencies, commit, or claim access to private tests.`;
  const beforeWorker = snapshotDirectory(worktree.checkout);
  const workerStartedAt = Date.now();
  const workerCommand = openCodeCommand(options.workerModel, worktree.checkout, workerPrompt, task);
  const workerOutcome = await execute(
    workerCommand.command,
    workerCommand.args,
    task.limits.max_wall_time_seconds * 1000,
    worktree.checkout,
    workerCommand.environment,
  );
  const workerSummary = summarizeOpenCode(workerOutcome, workerStartedAt);
  const afterWorker = snapshotDirectory(worktree.checkout);
  const workerChanges = compareSnapshots(beforeWorker, afterWorker);
  saveStage(runDirectory, "03-opencode-worker", workerPrompt, workerOutcome, workerSummary, workerChanges);
  writeFileSync(resolve(runDirectory, "worker.patch"), gitOutput(["diff", "--binary", "--no-ext-diff", "HEAD"], worktree.checkout) ?? "", { flag: "wx" });
  const workerVerification = await runChecks(task, worktree.checkout, false);
  writeFileSync(resolve(runDirectory, "worker-verification.json"), `${JSON.stringify(workerVerification, null, 2)}\n`, { flag: "wx" });
  stageResults.push({
    stage: "opencode-worker",
    status: statusFor(workerOutcome),
    elapsed_ms: workerOutcome.elapsedMs,
    time_to_first_edit_ms: workerSummary.time_to_first_edit_ms,
    reported_cost_usd: workerSummary.reported_cost_usd,
    changed_paths: workerChanges,
    visible_checks_passed: workerVerification.checks.every((check) => check.exit_code === 0 && !check.timed_out),
  });

  const integrationPrompt = `${taskPrompt}\n\n---\n\n# Your role: integration lead\n\nAn OpenCode worker has implemented the task in this worktree. Inspect its current diff and the committed visible tests. Run the visible command. Correct contract, safety, test, documentation, or maintainability defects only in the five allowed files. Preserve good worker code; do not rewrite without a concrete reason. Do not use the network, install dependencies, commit, or claim access to private tests. In the final response, distinguish worker code you accepted from integration changes you made.`;
  const beforeIntegration = snapshotDirectory(worktree.checkout);
  const integrationCommand = codexCommand(options.plannerModel, worktree.checkout, integrationPrompt, "workspace-write");
  const integrationOutcome = await execute(integrationCommand.command, integrationCommand.args, 900_000, worktree.checkout);
  const integrationSummary = summarizeCodex(integrationOutcome);
  const afterIntegration = snapshotDirectory(worktree.checkout);
  const integrationChanges = compareSnapshots(beforeIntegration, afterIntegration);
  saveStage(runDirectory, "04-codex-integration", integrationPrompt, integrationOutcome, integrationSummary, integrationChanges);
  writeFileSync(resolve(runDirectory, "integrated.patch"), gitOutput(["diff", "--binary", "--no-ext-diff", "HEAD"], worktree.checkout) ?? "", { flag: "wx" });
  const integrationVerification = await runChecks(task, worktree.checkout, false);
  writeFileSync(resolve(runDirectory, "integration-verification.json"), `${JSON.stringify(integrationVerification, null, 2)}\n`, { flag: "wx" });
  stageResults.push({
    stage: "codex-integration",
    status: statusFor(integrationOutcome),
    elapsed_ms: integrationOutcome.elapsedMs,
    changed_paths_during_stage: integrationChanges,
    visible_checks_passed: integrationVerification.checks.every((check) => check.exit_code === 0 && !check.timed_out),
  });

  const finalReviewPrompt = `${taskPrompt}\n\n---\n\n# Your role: final independent reviewer\n\nDo not edit any file. Inspect the current diff and run the visible verification command if permitted. Review correctness, validation and error consistency, data isolation, HTML injection safety, test quality, documentation, and file scope. Do not claim access to private tests. End with one valid JSON object on a single line using this shape: {"verdict":"pass|fail","findings":[{"severity":"high|medium|low","file":"path","issue":"text"}],"visible_verification":"pass|fail|not-run"}.`;
  const beforeFinalReview = snapshotDirectory(worktree.checkout);
  const finalReviewCommand = claudeCommand(options.reviewerModel, finalReviewPrompt, { allowVisibleCommand: visibleCommand });
  const finalReviewOutcome = await execute(finalReviewCommand.command, finalReviewCommand.args, 600_000, worktree.checkout);
  const finalReviewSummary = summarizeClaude(finalReviewOutcome);
  const finalReviewChanges = compareSnapshots(beforeFinalReview, snapshotDirectory(worktree.checkout));
  saveStage(runDirectory, "05-claude-final-review", finalReviewPrompt, finalReviewOutcome, finalReviewSummary, finalReviewChanges);
  writeFileSync(resolve(runDirectory, "final-review.md"), finalReviewSummary.final_text, { flag: "wx" });
  stageResults.push({ stage: "claude-final-review", status: statusFor(finalReviewOutcome), elapsed_ms: finalReviewOutcome.elapsedMs, read_only_changes: finalReviewChanges });

  const finalVerification = await runChecks(task, worktree.checkout, true);
  writeFileSync(resolve(runDirectory, "final-verification.json"), `${JSON.stringify(finalVerification, null, 2)}\n`, { flag: "wx" });
} catch (error) {
  workflowError = error.stack ?? error.message;
} finally {
  const finalSnapshot = snapshotDirectory(worktree.checkout);
  const changedPaths = compareSnapshots(initialSnapshot, finalSnapshot);
  const outOfScopePaths = changedPaths.filter((path) => !pathIsAllowed(path, task.allowed_paths));
  const finalPatch = gitOutput(["diff", "--binary", "--no-ext-diff", "HEAD"], worktree.checkout) ?? "";
  writeFileSync(resolve(runDirectory, "changes.json"), `${JSON.stringify({ changed_paths: changedPaths, out_of_scope_paths: outOfScopePaths }, null, 2)}\n`, { flag: "wx" });
  writeFileSync(resolve(runDirectory, "changes.patch"), finalPatch, { flag: "wx" });
  cleanupError = removeIsolatedWorktree(worktree);

  const verificationPath = resolve(runDirectory, "final-verification.json");
  const finalVerification = existsSync(verificationPath)
    ? JSON.parse(readFileSync(verificationPath, "utf8"))
    : { checks: [], infrastructure_errors: ["Final grading stage was not reached."] };
  const allChecksPassed = finalVerification.checks.length > 0
    && finalVerification.checks.every((check) => check.exit_code === 0 && !check.timed_out)
    && finalVerification.infrastructure_errors.length === 0;
  const readOnlyViolations = stageResults
    .filter((stage) => stage.read_only_changes?.length > 0)
    .map((stage) => stage.stage);
  const finishedAt = new Date();
  const acceptanceStatus = workflowError || outOfScopePaths.length > 0 || readOnlyViolations.length > 0 || !allChecksPassed
    ? "fail"
    : "pass";
  const result = {
    schema_version: "1.0",
    run_id: runId,
    status: workflowError ? "failed" : "complete",
    acceptance_status: acceptanceStatus,
    started_at: createdAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    elapsed_ms: finishedAt.getTime() - createdAt.getTime(),
    stages: stageResults,
    changed_paths: changedPaths,
    out_of_scope_paths: outOfScopePaths,
    read_only_violations: readOnlyViolations,
    final_checks_passed: allChecksPassed,
    workflow_error: workflowError,
    cleanup_error: cleanupError,
    artifacts: {
      manifest: "manifest.json",
      task_prompt: "task-prompt.md",
      lead_plan: "lead-plan.md",
      plan_review: "plan-review.md",
      worker_patch: "worker.patch",
      integrated_patch: "integrated.patch",
      final_review: "final-review.md",
      changes: "changes.json",
      patch: "changes.patch",
      verification: "final-verification.json",
    },
  };
  writeFileSync(resolve(runDirectory, "result.json"), `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ run_directory: relative(projectRoot, runDirectory), ...result }, null, 2));
  process.exitCode = acceptanceStatus === "pass" ? 0 : 1;
}
