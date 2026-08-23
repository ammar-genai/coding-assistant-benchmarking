import assert from "node:assert/strict";
import test from "node:test";

import { renderComparisonTable } from "./render-comparison-table.mjs";
import { summarizeAssistants } from "./summarize-assistants.mjs";

test("summarizes eligible runs by assistant in stable order", () => {
  const runs = Object.freeze([
    Object.freeze({
      run_id: "codex-slow",
      assistant: "Codex",
      status: "complete",
      acceptance_status: "pass",
      score: 91,
      elapsed_ms: 2_000,
    }),
    Object.freeze({
      run_id: "claude-best",
      assistant: "Claude Code",
      status: "complete",
      acceptance_status: "pass",
      score: 96,
      elapsed_ms: 1_250,
      comparison_eligible: true,
    }),
    Object.freeze({
      run_id: "codex-best",
      assistant: "Codex",
      status: "complete",
      acceptance_status: "pass",
      score: 95,
      elapsed_ms: 1_000,
    }),
    Object.freeze({
      run_id: "failed-run",
      assistant: "Claude Code",
      status: "complete",
      acceptance_status: "fail",
      score: 100,
      elapsed_ms: 10,
    }),
    Object.freeze({
      run_id: "excluded-run",
      assistant: "Codex",
      status: "complete",
      acceptance_status: "pass",
      comparison_eligible: false,
      score: 100,
      elapsed_ms: 10,
    }),
  ]);

  assert.deepEqual(summarizeAssistants(runs), [
    {
      assistant: "Claude Code",
      run_count: 1,
      best_score: 96,
      best_run_id: "claude-best",
      median_elapsed_ms: 1_250,
    },
    {
      assistant: "Codex",
      run_count: 2,
      best_score: 95,
      best_run_id: "codex-best",
      median_elapsed_ms: 1_500,
    },
  ]);
});

test("breaks a best-score tie with elapsed time", () => {
  const runs = [
    {
      run_id: "slower",
      assistant: "OpenCode",
      status: "complete",
      acceptance_status: "pass",
      score: 94,
      elapsed_ms: 1_100,
    },
    {
      run_id: "faster",
      assistant: "OpenCode",
      status: "complete",
      acceptance_status: "pass",
      score: 94,
      elapsed_ms: 900,
    },
  ];

  assert.equal(summarizeAssistants(runs)[0].best_run_id, "faster");
});

test("renders the exact Markdown table format", () => {
  const summaries = [
    {
      assistant: "Open|Code",
      run_count: 2,
      best_score: 95.5,
      best_run_id: "run|2",
      median_elapsed_ms: 1_250,
    },
  ];

  assert.equal(
    renderComparisonTable(summaries),
    [
      "| Assistant | Runs | Best score | Best run | Median time |",
      "|---|---:|---:|---|---:|",
      "| Open\\|Code | 2 | 95.5 | run\\|2 | 1.250 s |",
    ].join("\n"),
  );
});

test("renders an explicit empty state below the table header", () => {
  assert.equal(
    renderComparisonTable([]),
    [
      "| Assistant | Runs | Best score | Best run | Median time |",
      "|---|---:|---:|---|---:|",
      "",
      "_No eligible runs._",
    ].join("\n"),
  );
});
