import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { filterRuns, sortRuns, summarizeRuns } from "./run-explorer.mjs";

const runs = Object.freeze([
  Object.freeze({
    id: "codex-a",
    assistant: "Codex",
    model: "Sol",
    outcome: "pass",
    score: 94,
    elapsedSeconds: 24,
    costUsd: null,
  }),
  Object.freeze({
    id: "opencode-b",
    assistant: "OpenCode",
    model: "Kimi",
    outcome: "fail",
    score: 81,
    elapsedSeconds: 18,
    costUsd: 0.04,
  }),
  Object.freeze({
    id: "opencode-a",
    assistant: "OpenCode",
    model: "Qwen",
    outcome: "pass",
    score: 94,
    elapsedSeconds: 20,
    costUsd: 0.02,
  }),
]);

test("filters by assistant and outcome without mutating the input", () => {
  const result = filterRuns(runs, { assistant: "OpenCode", outcome: "pass" });

  assert.deepEqual(result.map((run) => run.id), ["opencode-a"]);
  assert.notEqual(result, runs);
  assert.deepEqual(runs.map((run) => run.id), ["codex-a", "opencode-b", "opencode-a"]);
});

test("sorts score ties by faster elapsed time and then run ID", () => {
  const result = sortRuns(runs, "score-desc");

  assert.deepEqual(result.map((run) => run.id), ["opencode-a", "codex-a", "opencode-b"]);
  assert.deepEqual(runs.map((run) => run.id), ["codex-a", "opencode-b", "opencode-a"]);
});

test("summarizes the visible runs", () => {
  assert.deepEqual(summarizeRuns(runs), {
    visibleCount: 3,
    passRatePct: 66.7,
    medianElapsedSeconds: 20,
    totalCostUsd: 0.06,
    costedRunCount: 2,
  });
});

test("ships the required accessible, responsive interface hooks", async () => {
  const [html, css] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
  ]);

  for (const id of ["assistant-filter", "outcome-filter", "sort-order"]) {
    assert.match(html, new RegExp(`<label[^>]+for=["']${id}["']`, "i"));
    assert.match(html, new RegExp(`<select[^>]+id=["']${id}["']`, "i"));
  }
  assert.match(html, /<main\b/i);
  assert.match(html, /aria-live=["']polite["']/i);
  assert.match(html, /id=["']reset-filters["']/i);
  assert.match(html, /id=["']results-list["']/i);
  assert.match(html, /id=["']empty-state["'][^>]+hidden/i);
  assert.match(css, /@media\s*\([^)]*max-width\s*:/i);
  assert.match(css, /:focus-visible/i);
  assert.doesNotMatch(html, /style\s*=/i);
});
