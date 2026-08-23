# T3 model and harness matrix

Date: 2026-08-22 to 2026-08-23  
Task: `T3-comparison-summary@1.0.1`  
Baseline commit: `71d5f53d35d70d3c875de7b4b6e7a195d6a9797f`

## Purpose

T3 is the first moderate write benchmark. It requires two feature
implementations and assistant-authored tests across three allowed files. The
feature filters and validates run records, groups them by assistant, selects a
best run with deterministic tie-breakers, calculates numeric medians, and
renders a validated Markdown comparison table.

Every counted run used the same prompt and baseline in a disposable detached
Git worktree. Passing required:

- all committed tests;
- at least two passing, non-placeholder assistant-authored tests;
- all 10 private contract and edge-case tests;
- changes limited to the three declared files.

## Counted results

| Harness | Model route | Elapsed | Functional checks | Scope | Score | Outcome |
|---|---|---:|---:|---:|---:|---:|
| OpenCode | DeepSeek V4 Flash via Ollama Cloud | 20.410 s | pass | pass | 100/100 | pass |
| Codex | DeepSeek V4 Flash via Ollama Cloud | 20.376 s | pass | fail | 90/100 | fail |
| Claude Code | DeepSeek V4 Flash via Ollama Cloud | 58.158 s | pass | pass | 100/100 | pass |
| OpenCode | Kimi K2.7 Code via Ollama Cloud | 24.824 s | pass | pass | 100/100 | pass |
| Codex | Kimi K2.7 Code via Ollama Cloud | 35.194 s | pass | pass | 100/100 | pass |
| Claude Code | Kimi K2.7 Code via Ollama Cloud | 55.512 s | pass | pass | 100/100 | pass |
| Codex | subscription default | 106.852 s | pass | pass | 100/100 | pass |
| Claude Code | subscription default (`claude-sonnet-5`) | 44.801 s | pass | pass | 100/100 | pass |

The Codex subscription run did not emit an exact served-model identifier in its
JSON event stream, so the report keeps the recorded `subscription-default`
label instead of guessing.

## Run IDs

| Harness and model | Run ID |
|---|---|
| OpenCode + DeepSeek | `2026-08-23T00-05-21.334Z_opencode_T3-comparison-summary` |
| Codex + DeepSeek | `2026-08-23T00-06-28.890Z_codex_T3-comparison-summary` |
| Claude Code + DeepSeek | `2026-08-23T00-07-07.363Z_claude_T3-comparison-summary` |
| OpenCode + Kimi | `2026-08-23T00-05-48.443Z_opencode_T3-comparison-summary` |
| Codex + Kimi | `2026-08-23T00-08-15.453Z_codex_T3-comparison-summary` |
| Claude Code + Kimi | `2026-08-23T00-08-58.077Z_claude_T3-comparison-summary` |
| Codex subscription default | `2026-08-23T00-10-05.721Z_codex_T3-comparison-summary` |
| Claude Code subscription default | `2026-08-23T00-14-15.447Z_claude_T3-comparison-summary` |

## Important observations

### Functional quality

All eight implementations passed every visible and private functional check.
The only counted failure was scope control. This is a useful distinction: the
model solved the feature correctly, but the assistant workflow still failed the
task contract.

### Scope failure

Codex + DeepSeek ran an unnecessary project-wide typecheck after the requested
tests. That command generated `tsconfig.tsbuildinfo`, producing a fourth changed
path outside the three-file allowance. The functional score remains 90/100, but
the run outcome is a failure because clean scope is a release requirement.

### Harness effect

OpenCode was the fastest clean harness for both open-model routes. Kimi passed
cleanly through all three harnesses. DeepSeek also implemented the feature
correctly through all three, but its Codex run lost scope control. This shows why
the assistant harness must be evaluated separately from the underlying model.

### Native defaults

The Claude Code subscription default reported `claude-sonnet-5` and passed in
44.801 seconds. The Codex subscription default passed but took 106.852 seconds.
One run per route is not enough to claim a general speed ranking, and the task
was bounded enough that every counted model achieved full functional quality.

### Implementation diversity

Every counted run produced a different patch digest while satisfying the same
contract. Passing was therefore not tied to one reference-code shape.

Raw token and cost telemetry remains excluded from ranking because the adapters
report it differently. A later harness revision should normalize provider,
cached-input, output, and subscription telemetry before making cost claims.

## Excluded setup attempts

Two attempts are retained as engineering evidence but excluded from the matrix:

1. `T3@1.0.0` OpenCode + DeepSeek exposed an ambiguity in renderer validation.
   The private grader required a positive integer `run_count`, while the first
   prompt only referred to valid value types. The requirement was made explicit,
   the task was bumped to `1.0.1`, and all counted runs restarted from the new
   baseline.
2. The first Claude subscription-default attempt ended before model work because
   its OAuth session had expired. After interactive login, only that row was
   rerun and counted.

## Selected distributed workflow

The first distributed benchmark should compare a single-agent control with this
four-stage workflow on the same new T4 task:

1. Claude Code with its subscription frontier model creates a read-only plan and
   acceptance checklist.
2. OpenCode + Kimi K2.7 Code implements the bounded change in an isolated
   worktree using the plan.
3. The Claude frontier model reviews the patch and visible test evidence without
   seeing private tests.
4. Kimi receives at most one repair pass, after which the private grader decides
   the outcome.

Use the Claude subscription route because its exact model was observable and it
completed T3 cleanly. Use OpenCode + Kimi as the worker because it was the
fastest clean Kimi route. The control should run Claude alone on T4. Compare
final score, total elapsed time, frontier-model time, repair count, scope, and
human interventions. Do not claim savings until token or usage telemetry is
normalized.
