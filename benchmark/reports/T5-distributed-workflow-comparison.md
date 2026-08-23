# T5 distributed workflow versus solo frontier control

Date: 2026-08-23

Task: `T5-review-queue@1.0.0`

Corrected grader: `T5-review-queue-v2@1.0.1`

## Result

The frontier-plan/open-worker pattern worked, but it did not beat the solo
frontier control on final quality or time.

| Route | Corrected score | Acceptance | Time | Metered API cost | Visible | Corrected private |
|---|---:|---|---:|---:|---:|---:|
| Codex plan → Claude plan review → OpenCode/Kimi worker → Codex integration → Claude final review | 100 | Pass | 536.704 s | $0.6175818 | 9/9 | 7/7 |
| Codex/GPT-5.6 Sol solo control | 100 | Pass after grader correction | 150.206 s | Not exposed; subscription | 8/8 | 7/7 |

The distributed route took 3.57 times as long, or 386.498 seconds longer. Its
value was the audit trail and separation of roles, not a higher score.

## What each assistant contributed

### Codex: lead plan and integration

Codex produced the lead plan in 86.071 seconds. It defined the store, API,
rendering, testing, ownership, and verification sequence without changing the
worktree.

After implementation, Codex spent 82.567 seconds reviewing the actual patch and
running the visible gate. It made no edit. The worker, integrated, and final
patches have the same SHA-256 digest, so no frontier repair is being attributed
to Kimi.

### Claude Code: plan challenge and independent review

Claude's pre-implementation review took 93.772 seconds and reported seven gaps
or decisions to pin down. The useful findings included exact return and record
shapes, copy isolation in both directions, fresh response headers, malformed
body behavior, and route-edge handling. It also translated visible-test
assumptions into a concrete worker checklist.

Claude's final review took 160.346 seconds, reran the visible suite, read all
five changed files, and returned `pass`. It reported four low-severity judgment
calls and no medium or high finding. One ad-hoc Bash probe was correctly denied;
the frozen visible command remained available. Neither Claude stage changed a
file.

### OpenCode and Kimi K3: complete worker implementation

Kimi implemented all five files in 112.515 seconds and made its first edit at
84.725 seconds. Before any integration stage it passed 9 of 9 visible tests.
The saved worker patch also passes all 7 corrected private checks. It used 20
tool calls: 10 reads, 2 globs, 3 Bash calls, and 5 writes; one out-of-policy Git
discovery command was denied.

OpenCode reported 366,939 total tokens including cache reads and a metered cost
of $0.6175818. That brought cumulative OpenRouter spend to $1.3764798 under the
approved $1.50 ceiling. No paid repair, Qwen call, limit increase, or Anthropic
usage credit was used.

## Solo control

Codex completed the same frozen task from a fresh worktree and unaugmented
prompt in 150.206 seconds. It changed the same five files, added four student
tests, passed all eight visible tests, and passed every behavioral private
check.

The original private suite nevertheless marked it failed because the README
used `in memory` instead of the literal hyphenated phrase `in-memory`. The same
README explicitly says the store is not durable and resets on process restart,
which is the task's requirement. The raw failure remains preserved. The
versioned corrected suite accepts either spelling, and the saved patch passes
7 of 7 without a rerun or edit.

## Cost and token notes

- Kimi's $0.6175818 is the only new metered API charge in this block.
- Claude Code reported $1.0331445 of CLI cost telemetry across its two Opus
  stages, including auxiliary model usage. The subscription reported that
  overage was not being used, so this is not treated as billed API spend.
- Codex did not expose a dollar amount for subscription inference.
- Codex reported 221,590 input and 6,306 output tokens across its two
  distributed stages; its 188,672 cached tokens are a subset of input.
- Claude and OpenCode use different cache and total-token definitions. The
  project preserves those values but does not add them into a misleading total.

## Decision

Frontier planning plus a hosted open worker is viable: Kimi delivered a fully
accepted cross-layer feature, and neither frontier integration nor private
grading found a defect requiring repair. OpenCode is therefore credible as a
bounded implementation worker, not merely a model launcher.

The all-assistant workflow did not beat one strong Codex session for this task.
Use the distributed pattern when independent plan challenge, model diversity,
or an auditable review trail matters. For ordinary bounded work, the solo
frontier route was simpler and much faster.

This is one task. It supports the next pilot but does not justify a general
winner or an automatic reversed-role paid repeat.
