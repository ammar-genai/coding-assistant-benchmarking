# T2 shared-model write pilot

Date: 2026-08-22  
Task: `T2-filter-valid-runs@1.0.0`  
Baseline commit: `4a335e72fb728c7c7b21f561ea653daa354ffb3d`  
Model: `ollama/deepseek-v4-flash:cloud`

## Purpose

This block checks whether Codex, Claude Code, and OpenCode can perform the same
write-enabled bug-fix task through the controlled runner. It is a harness smoke
test, not enough evidence to rank the assistants generally.

Each run received the same prompt and repository commit in a disposable detached
Git worktree. Only
`benchmark/fixtures/T2-run-filter/select-comparison-runs.mjs` was writable under
the task contract. The grader required the committed visible suite, a separate
hash-checked private suite, and zero out-of-scope changes.

## Results

| Assistant | Run ID | Elapsed | Visible | Private | Scope | Score |
|---|---|---:|---:|---:|---:|---:|
| OpenCode | `2026-08-22T22-57-43.182Z_opencode_T2-filter-valid-runs` | 7.072 s | 2/2 | 5/5 | pass | 100/100 |
| Codex | `2026-08-22T22-58-51.606Z_codex_T2-filter-valid-runs` | 7.166 s | 2/2 | 5/5 | pass | 100/100 |
| Claude Code | `2026-08-22T22-58-16.284Z_claude_T2-filter-valid-runs` | 23.648 s | 2/2 | 5/5 | pass | 100/100 |

The rubric score is fully earned in each case:

- visible tests: 25/25;
- private tests: 30/30;
- root-cause identification: 15/15;
- scope control: 15/15;
- implementation quality: 10/10;
- final report: 5/5.

## Integrity checks

- All three runs changed exactly one allowed file.
- All three produced the same minimal two-operator patch.
- The three patch files have the same SHA-256 digest:
  `65e7817388ad10c7133b05ed38721f3f3753e8adb2a31e1430965de5869e4946`.
- The private test file was outside every assistant worktree, and its digest was
  checked against the frozen task contract before grading.
- The temporary worktrees were removed after evidence capture; the main checkout
  remained unchanged.

## Interpretation

The main outcome is that the controlled write workflow works for all three
assistants with the same cloud-hosted open model. OpenCode and Codex were nearly
tied on elapsed time. Claude Code was slower on this run, but the task is too
small and the sample size is one, so that gap should not be treated as a general
performance conclusion.

Raw token and cost fields are not compared here. The three adapters expose
different telemetry, and those numbers are not yet normalized enough for a fair
cost claim.

## Next benchmark

Build T3 as a moderate multi-file feature task with a 15–30 minute human
reference solution. It should require understanding an existing contract,
editing two to four files, adding or updating tests, and handling private edge
cases. Run it first as another shared-model block, then compare the native
subscription defaults for Codex and Claude Code. After that, use the resulting
evidence to design the first distributed workflow where a frontier model plans
and reviews while a lower-cost model implements a bounded subtask.
