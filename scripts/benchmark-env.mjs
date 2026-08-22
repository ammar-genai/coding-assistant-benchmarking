import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args = []) {
  try {
    return execFileSync(command, args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20_000,
    }).trim();
  } catch (error) {
    const message = error?.stderr?.toString().trim() || error.message;
    return `unavailable: ${message}`;
  }
}

function firstLine(value) {
  return value.split("\n")[0] || value;
}

function hardware() {
  const raw = run("system_profiler", ["SPHardwareDataType", "-json"]);
  try {
    const parsed = JSON.parse(raw).SPHardwareDataType?.[0] ?? {};
    return {
      model_name: parsed.machine_name ?? null,
      model_identifier: parsed.machine_model ?? null,
      chip: parsed.chip_type ?? null,
      memory: parsed.physical_memory ?? null,
    };
  } catch {
    return { raw };
  }
}

const gitCommit = run("git", ["rev-parse", "--verify", "HEAD"]);
const record = {
  schema_version: "1.0",
  recorded_at: new Date().toISOString(),
  system: {
    os: `macOS ${run("sw_vers", ["-productVersion"])}`,
    hardware: hardware(),
  },
  tools: {
    codex: firstLine(run("codex", ["--version"])),
    claude: firstLine(run("claude", ["--version"])),
    opencode: firstLine(run("opencode", ["--version"])),
    pi: firstLine(run("pi", ["--version"])),
    ollama: firstLine(run("ollama", ["--version"])),
    node: firstLine(run("node", ["--version"])),
  },
  ollama_models: run("ollama", ["list"]),
  repository: {
    path: projectRoot,
    git_commit: gitCommit.startsWith("unavailable:") ? null : gitCommit,
    status: run("git", ["status", "--short"]),
  },
  note: "Authentication state and account identifiers are intentionally excluded.",
};

const json = `${JSON.stringify(record, null, 2)}\n`;

if (process.argv.includes("--write")) {
  const stamp = record.recorded_at.replaceAll(":", "-");
  const outputPath = resolve(projectRoot, "benchmark", "environment", `${stamp}.json`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, json, { flag: "wx" });
  console.log(outputPath);
} else {
  process.stdout.write(json);
}
