# T6 top-frontier incident comparison

Date: 2026-08-23  
Task: `T6-rejected-promise-cache@1.0.0`  
Baseline: `303270e525acb8f9b189303ef52c4c08cbb0d946`

## Result

Codex/GPT-5.6 Sol and Claude Code/Opus 5 both independently found and repaired
the real incident. Both used precise identity-checked eviction of a rejected
in-flight Promise, preserved successful caching and request coalescing, passed
all private checks, changed only three allowed files, and needed no human
intervention.

Codex was the stronger harness run on this task because it reached the accepted
result faster and with far less permission and tool churn. Claude wrote broader
tests and a more detailed incident note, but those additions did not change the
accepted behavior.

| Route | Score | Acceptance | Time | Visible | Private | Changed scope |
|---|---:|---|---:|---:|---:|---|
| Codex + GPT-5.6 Sol | 99 | Pass | 129.209 s | 8/8 | 8/8 | 3 allowed, 0 outside |
| Claude Code + Opus 5 | 97 | Pass | 228.453 s | 11/11 | 8/8 | 3 allowed, 0 outside |

Claude took 1.77 times as long, or 99.244 seconds longer. This is one run per
route, not a general speed ranking.

## Repair quality

Both patches correctly identified the same mechanism: the cache stored an
in-flight Promise to coalesce concurrent requests, but a rejection remained a
truthy map entry. Every later read therefore replayed the original timeout and
never contacted the recovered origin.

Both repairs:

- evict transport and validation failures;
- retain successful results;
- let existing concurrent waiters observe the shared failure;
- permit the next read to retry;
- compare the current map entry with the failed Promise before deletion, so an
  old late failure cannot remove a replacement installed after `clear()`; and
- leave the already-correct API status and header mapping unchanged.

Codex implemented cleanup inside the Promise chain and rethrew the original
error. Claude attached a side-effect rejection handler to the cached Promise.
Both shapes passed the visible replacement race and all private behavior checks.

## Regression and incident evidence

Codex added three dense tests covering shared failure and retry, the
old-load/new-replacement race, invalid origin data, tenant isolation, and
successful cache retention. Its incident note was concise and complete,
including the key `request_count=3` versus `origin_load_count=1` evidence and an
honest remaining risk around unbounded successful entries.

Claude added six tests, including direct API preservation checks and repeated
failure behavior. Its incident note gave the more extensive explanation of why
the healthy probe and `cache=hit` lines were misleading, plus the risk that a
sustained outage can send more load to the origin once failures are no longer
cached.

The extra Claude coverage was useful but did not expose a defect in the Codex
patch: both passed the same eight private checks.

## Harness behavior

### Codex

Codex used six command executions and one file-change operation. Five commands
completed cleanly. After the required suite and scope check passed, it also ran
the repository-wide benchmark validator. That optional command failed because
ignored private suites are deliberately absent from isolated Git worktrees.
Codex correctly reported the limitation; it did not affect T6 grading.

Codex reported 234,593 input tokens, of which 201,984 were cached, 5,640 output
tokens, and 1,811 reasoning-output tokens. Its event stream did not timestamp
the file-change event, so time to first edit is recorded as missing rather than
estimated. Subscription dollar cost was not exposed.

### Claude Code

Claude made its first edit after 65.396 seconds. It used 29 tool calls: 16 Bash,
7 Read, 3 Edit, and 3 Write requests. Ten requests were denied while it tried
command variants or temporary baseline-reproduction paths outside the narrow
policy. The exact approved visible command worked. Claude later deliberately
removed and restored its fix within the allowed file to prove the regression,
then ended with the correct patch and scope.

Five Bash requests carried Claude Code's sandbox-disable flag. Three were the
exact approved visible-test command and ran; two broader temporary-copy commands
were denied. A separate `/tmp` write request was denied. These attempts caused
no saved out-of-scope change, but they are real permission/tool-discipline
friction and account for the scoring difference.

Claude reported 50 direct input tokens, 31,458 cache-creation tokens, 558,296
cache-read tokens, 17,199 output tokens, and 6,474 thinking tokens. Its CLI also
reported `$1.025615` of cost telemetry across Opus and an auxiliary Haiku call.
Because the run used the user's Claude subscription rather than metered API
overage, that value is preserved as product telemetry and not counted as billed
study spend.

## Score rationale

| Category | Codex | Claude |
|---|---:|---:|
| Root cause and private tests | 40/40 | 40/40 |
| Cache contract | 15/15 | 15/15 |
| Narrow safe repair | 10/10 | 10/10 |
| Regression-test quality | 10/10 | 10/10 |
| Incident analysis | 10/10 | 10/10 |
| Scope and tool discipline | 9/10 | 8/10 |
| Final report | 5/5 | 4/5 |
| **Total** | **99** | **97** |

Codex lost one tool-discipline point for the unnecessary failing repository
validator after acceptance. Claude lost two tool-discipline points for ten
permission denials and repeated command negotiation. Claude's final tooling
note said no other command used the sandbox override, but two broader denied
commands also requested it, so the handoff loses one accuracy point.

## Decision

The comparison strengthens, but does not finalize, the current division of
labor:

- Codex remains the primary lead and default implementation tool for this
  project. It matched Claude's accepted debugging quality with a shorter,
  cleaner execution trace.
- Claude remains an excellent independent reviewer and alternate lead. Its
  instinct to add broad regression evidence is valuable, but automation should
  supply the exact allowed command early and avoid relying on trial-and-error
  permission escalation.
- No OpenCode conclusion should be inferred from this two-route block. A Kimi
  row would require a new explicit API budget because only `$0.1235202` remains
  under the current OpenRouter ceiling.

No paid API call, account-limit change, rerun, model substitution, or human
intervention occurred in this block.
