# T1 Qwen3.8-27B OpenRouter pilot

Date: 2026-08-23

Run ID: `2026-08-23T04-12-52.088Z_opencode_T1-repo-map`

Baseline commit: `9352b4ad9c4e4f043f77c86dd6a2d52f139e09df`

Task: `T1-repo-map@1.0.0`

Prompt SHA-256: `80a78377fc3d68564306811a74ea22c8d5d30c3aeeb3f3a4f95c85b33c6d12a3`

Harness: OpenCode `1.18.21`

Model: `openrouter/qwen/qwen3.8-27b`

Access path: OpenRouter API

## Outcome

The run passed the frozen read-only task with a manually graded score of
**93/100**. It completed with exit code 0, did not time out, requested no human
intervention, and made no workspace changes.

| Measure | Result |
| --- | ---: |
| Score | 93/100 |
| Elapsed time | 141.210 s |
| Final-answer length | 828 words |
| Tool calls | 32 |
| Input tokens | 352,593 |
| Output tokens | 3,955 |
| Reasoning tokens | 3,390 |
| Total tokens | 363,858 |
| OpenCode-reported cost | $0.1632682 |

The token and cost totals sum the ten `step_finish` events emitted by OpenCode.
The 32 permitted read-only tool calls comprised 30 reads, one glob, and one
grep.

## Rubric

| Criterion | Score | Finding |
| --- | ---: | --- |
| Architecture | 25/25 | Accurate and unusually complete map of the UI, Cloudflare/vinext runtime, benchmark harness, and inactive scaffolding. |
| Main request flow | 20/20 | Correct worker-to-app flow with concrete paths and useful line references. |
| Repository evidence | 23/25 | Strong citations overall; one conclusion treated a stale resume instruction as current Git state. |
| Risks and unknowns | 10/15 | Two high-value risks were correct; the claimed dirty-baseline risk was false for the clean recorded worktree. |
| Small change plan | 10/10 | Small, accessible, test-backed, and protective of frozen evidence. |
| Scope and format | 5/5 | Exact sections, 828 words, no forbidden action, and no workspace change. |

## Strong points

- It understood that this repository contains both a user-facing study page and
  a controlled benchmark harness.
- It traced the production request through `worker/index.ts`, vinext,
  `app/layout.tsx`, and `app/page.tsx`, then connected that path to the
  rendered-worker test.
- Its explanation of the fresh-clone/private-suite limitation was concrete and
  correct: the validator requires ignored private suites that a new clone does
  not contain.
- Its frozen-contract/UI duplication risk was supported by a real wording drift
  between `benchmark/STUDY.md` and `app/page.tsx`.
- Its implementation plan respected the frozen-study rule and included
  accessibility, focused checks, a full gate, and a final scope review.

## Deduction

The answer named a "dirty baseline before recorded runs" as its third risk. It
cited `RESUME.md`, whose next-step list had not yet been updated after the setup
commit, and inferred that the checkout might still be ahead of its last commit.
The recorded manifest and runner precondition show the opposite: the run began
from clean commit `9352b4a`. The cited text existed, so this was not fabricated
file evidence, but it was a failure to distinguish stale documentation from
verified current state.

## Interpretation

This is a successful first coding-assistant pilot for the 27B model. The answer
quality is competitive with the earlier T1 assistant pilot, but the blocks used
different repository commits and only one run each, so the scores are not a
fair model ranking.

The run also shows a meaningful efficiency concern. Qwen took 141.210 seconds
and OpenCode repeatedly sent large read contexts, producing 352,593 reported
input tokens and a $0.1632682 reported charge. That behavior may come from the
model's broad repository-reading strategy, OpenCode's context handling, or the
combination. It requires repeated same-baseline tests before attribution.

## Next experiment

Use a new same-baseline OpenCode model block rather than comparing this result
directly with older runs. The smallest useful block is DeepSeek, Kimi, and Qwen
on frozen T2 in randomized order, one run each, followed by a decision on
whether Qwen advances to the more expensive T3 task. Compare correctness,
elapsed time, tool calls, input/output/reasoning tokens, reported cost, scope,
and intervention count.
