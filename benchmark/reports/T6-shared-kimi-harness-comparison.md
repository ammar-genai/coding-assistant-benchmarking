# T6 shared-Kimi harness comparison

Date: 2026-08-23

Protocol: `benchmark/blocks/T6-shared-kimi-harness-2026-08-23.json`

Results: `benchmark/blocks/T6-shared-kimi-harness-2026-08-23.results.json`

## Result

All three assistants completed the same difficult debugging task with the same
`ollama/kimi-k2.7-code:cloud` model. Every patch passed all eight private checks,
stayed within the same three allowed fixture files, and required no human
intervention.

| Harness | Score | Time | First edit | Visible | Private | Tool calls | Denials |
|---|---:|---:|---:|---:|---:|---:|---:|
| OpenCode | 99 | 55.115 s | 11.660 s | 11/11 | 8/8 | 21 | 1 |
| Codex | 98 | 93.662 s | Not exposed | 9/9 | 8/8 | 17 | 0 |
| Claude Code | 98 | 78.832 s | 30.884 s | 8/8 | 8/8 | 19 | 2 |

OpenCode was fastest. Claude took 1.43 times its time, and Codex took 1.70
times its time. This is one run per harness, so it is a task result rather than
a general speed ranking.

## Patch quality

All three found the same root cause and used the same safe mechanism. The cache
stored an in-flight Promise, but a rejection remained in the map and poisoned
future reads. Each repair evicted a failed Promise only when it was still the
current entry, so an old late failure could not delete a replacement installed
after `clear()`.

The saved patches were independent:

- OpenCode added six student tests, including invalid-origin recovery, tenant
  isolation, API preservation, shared failure, and the replacement race.
- Codex added four student tests covering API recovery, invalid-origin retry,
  tenant isolation, and the replacement race.
- Claude Code added three focused tests covering retry, shared failure, and the
  replacement race.

Every suite satisfied the private meaningful-regression check. Each incident
note contained the correct diagnosis, log evidence, misleading-signal
explanation, repair, coverage, and remaining risk.

## Harness behavior

### OpenCode

- Used native Read, Edit, and Write operations and 21 total tool calls.
- Requested a shorter one-file test command once; the exact permission rule
  denied it. The model immediately used the frozen two-file command.
- Made the first edit after 11.660 seconds and produced no stderr output.
- Summed 226,625 input and 7,541 output tokens across its step records.
- Reported `$0`. That is not proof that hosted inference has no underlying
  cost.

### Codex

- Used 17 shell command executions. The first frozen test run correctly
  reproduced the seeded failure; later runs passed.
- Its JSON stream did not timestamp shell-driven file writes, so first-edit
  time remains missing.
- Reported 305,461 input and 9,828 output tokens.
- The Ollama adapter could not load model metadata and emitted 12,958 repeated
  telemetry warnings, producing a 2.35 MB stderr log. This did not affect the
  patch but is real operating friction.
- Exposed no cost estimate.

### Claude Code

- Used 19 tool calls through native Read, Edit, Write, and Bash operations.
- Two extra lint commands were denied. The frozen test command remained
  available and passed.
- Made the first edit after 30.884 seconds.
- Reported 218,906 input and 11,142 output tokens.
- Reported `$1.400835` through the Ollama wrapper. This is preserved as wrapper
  telemetry, not counted as metered study spend.

## Permission caveat

The intended policy was the same, but the effective controls were not identical
because the products expose different permission systems. OpenCode used path
and exact-command rules. Claude used native edit tools with an exact Bash
allowance. Codex used a workspace-write sandbox and relied on the task contract
plus post-run scope grading for file limits.

That difference is not hidden as a fairness adjustment: permission precision is
part of the assistant harness being measured.

## Score rationale

| Category | OpenCode | Codex | Claude Code |
|---|---:|---:|---:|
| Root cause and private tests | 40/40 | 40/40 | 40/40 |
| Cache contract | 15/15 | 15/15 | 15/15 |
| Narrow safe repair | 10/10 | 10/10 | 10/10 |
| Regression-test quality | 10/10 | 10/10 | 10/10 |
| Incident analysis | 10/10 | 10/10 | 10/10 |
| Scope and tool discipline | 9/10 | 8/10 | 8/10 |
| Final report | 5/5 | 5/5 | 5/5 |
| **Total** | **99** | **98** | **98** |

OpenCode lost one point for one denied command variant. Codex lost two points
for the broad shell-only trace and severe repeated adapter warnings. Claude lost
two points for two unnecessary lint requests outside the exact command policy.

## Decision

This is the strongest direct evidence that OpenCode is worth exploring as a
harness rather than only as a model launcher. With model quality fixed on a
complex maintenance task, it was fastest, cleanest operationally, and equally
correct. The current adoption verdict remains **strong secondary tool** because
the study still has only one run per route and its native browser and managed
cloud experience remain behind the two frontier products.

Codex remains the default lead and Claude Code remains the independent reviewer
because those roles also include their native frontier models, integration
behavior, and broader product features. This shared-model result isolates the
harness; it does not replace the top-native result.

No OpenRouter call, Anthropic usage credit, account-limit change, rerun, model
substitution, or human intervention occurred. Metered OpenRouter spend remains
`$1.3764798`.
