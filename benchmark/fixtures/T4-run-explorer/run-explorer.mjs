export const sampleRuns = Object.freeze([
  Object.freeze({
    id: "cx-sol-01",
    assistant: "Codex",
    model: "GPT-5.6 Sol",
    outcome: "pass",
    score: 96,
    elapsedSeconds: 72.4,
    costUsd: null,
  }),
  Object.freeze({
    id: "cc-fable-01",
    assistant: "Claude Code",
    model: "Claude Fable 5",
    outcome: "pass",
    score: 97,
    elapsedSeconds: 88.1,
    costUsd: null,
  }),
  Object.freeze({
    id: "oc-kimi-01",
    assistant: "OpenCode",
    model: "Kimi K3",
    outcome: "pass",
    score: 93,
    elapsedSeconds: 45.2,
    costUsd: 0.14,
  }),
  Object.freeze({
    id: "oc-qwen-01",
    assistant: "OpenCode",
    model: "Qwen3.8-27B",
    outcome: "fail",
    score: 78,
    elapsedSeconds: 41.8,
    costUsd: 0.05,
  }),
  Object.freeze({
    id: "cc-fable-02",
    assistant: "Claude Code",
    model: "Claude Fable 5",
    outcome: "fail",
    score: 84,
    elapsedSeconds: 101.6,
    costUsd: null,
  }),
  Object.freeze({
    id: "cx-sol-02",
    assistant: "Codex",
    model: "GPT-5.6 Sol",
    outcome: "pass",
    score: 91,
    elapsedSeconds: 64.9,
    costUsd: null,
  }),
]);

export function filterRuns() {
  throw new Error("Not implemented");
}

export function sortRuns() {
  throw new Error("Not implemented");
}

export function summarizeRuns() {
  throw new Error("Not implemented");
}

// Implement browser rendering and interactions without external dependencies.
