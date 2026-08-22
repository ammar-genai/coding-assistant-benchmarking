# T1 Shared-Model Assistant Pilot

Block ID: `T1-deepseek-v4-flash-2026-08-22`  
Baseline commit: `4018483c`  
Task: `T1-repo-map@1.0.0`  
Prompt SHA-256: `80a78377fc3d68564306811a74ea22c8d5d30c3aeeb3f3a4f95c85b33c6d12a3`  
Model: `deepseek-v4-flash:cloud` through Ollama  
Runs per assistant: one

## Conditions

Every eligible run used the same committed repository, task prompt, hosted model, read-only tools, zero interventions, and 10-minute limit. The runner created a fresh detached Git worktree for every assistant, captured before/after file hashes, then removed the worktree. Prior run evidence was not present in the assistant checkout.

## Results

| Assistant | Score | Elapsed | Reported input tokens | Reported output tokens | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Codex | 95 | 33.783 s | 259,574 | 4,726 | Pass |
| OpenCode | 94 | 24.510 s | 33,861 | 1,328 | Pass |
| Pi | 92 | 23.735 s | 19,570 | 1,597 | Pass |
| Claude Code | 92 | 75.578 s | 185,451 | 6,160 | Pass |

All four assistants completed without an intervention, forbidden action, timeout, or workspace change.

## What this first run suggests

- **Codex produced the strongest answer** by a narrow margin. Its risk analysis and UI-test plan were the most technically precise.
- **OpenCode had the best quality/time balance** in this run: one point behind Codex and about nine seconds faster.
- **Pi was the fastest and reported the fewest input tokens.** Its answer was strong, but it used fewer concrete line references than Codex and OpenCode.
- **Claude Code was the slowest in this configuration.** Its answer was good, but its proposed localStorage-derived badge did not fully match its unconditional SSR assertion.
- The quality spread is only three points. One run is not enough to call a winner.

Token accounting is assistant-specific and not perfectly comparable. In particular, Codex and Claude Code appear to resend substantially more tool context through the Ollama-compatible endpoints. Claude Code reported a `$1.100385` cost estimate while the other wrappers reported zero or no cost; treat that as a harness estimate, not a confirmed Ollama charge or a cross-assistant cost comparison.

## Eligible evidence

- `2026-08-22T19-17-21.591Z_opencode_T1-repo-map`
- `2026-08-22T19-18-05.039Z_pi_T1-repo-map`
- `2026-08-22T19-18-51.170Z_codex_T1-repo-map`
- `2026-08-22T19-19-46.768Z_claude_T1-repo-map`

Earlier setup runs are excluded from comparison because they used an older runner, a different baseline commit, or a shared checkout that exposed prior evidence.

## Next block

1. Build T2 as a small seeded bug fixture with visible and hidden tests.
2. Manually solve and freeze T2 before any assistant sees it.
3. Run the same four-assistant DeepSeek block from one new baseline commit.
4. Repeat T1 once later in randomized order to measure run-to-run variance.
5. Only after T2 succeeds, start the native-product block with Codex subscription models and Claude subscription models.
