# T4 top-native comparison

Date: 2026-08-23

Protocol: `T4-top-native-v2-2026-08-23`

Baseline: `d72825c3870ae326de20ade957ed9ddccc282404`

Task: `T4-run-explorer-v2@1.0.1`

This is one controlled run per route. It shows how the strongest accessible
assistant/model pairings behaved on one complex UI task; it does not establish
a universal winner.

## Headline result

Codex + GPT-5.6 Sol, OpenCode + Kimi K3, and Claude Code + Opus 5 all produced
complete, scoped, browser-correct solutions and scored 100. OpenCode + Kimi K3
was the fastest successful route. OpenCode + Qwen3.8-27B built a working partial
interface but hit the fixed 20-minute timeout before adding tests or reporting
completion.

| Route | Result | Score | Time | First edit | Tests (visible/private) | Tool calls | Reported cost |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Codex + GPT-5.6 Sol | Pass | 100 | 350.694 s | Not exposed | 8/8, 7/7 | 11 | Subscription; not exposed |
| OpenCode + Kimi K3 | Pass | 100 | 221.644 s | 183.171 s | 12/12, 7/7 | 20 | $0.5790162 |
| Claude Code + Opus 5 | Pass | 100 | 483.388 s | 108.372 s | 14/14, 7/7 | 44 | $2.473437 telemetry |
| OpenCode + Qwen3.8-27B | Timeout | 87 post-timeout | 1,200.289 s | 1,047.243 s | 5/5, 6/7 | 15 | $0.1518036 |

The Qwen score is a post-timeout rubric application to the saved patch, not a
runner acceptance result. It lost points for the failed private student-test
check, no assistant-authored tests, and no final report.

## Browser QA

Every saved patch, including Qwen's partial patch, was reconstructed from its
recorded diff and tested through the visible interface. All four passed:

- initial summaries and six visible outcome labels;
- assistant and outcome filters, including combined filters;
- score, time, and known-cost ordering;
- empty state and reset behavior;
- keyboard focus with a 3 px visible outline;
- desktop and 390 px layouts without horizontal overflow; and
- browser console inspection with no warnings or errors.

Codex used wide evidence rows on desktop. Kimi and Qwen used three card columns,
and Opus used four. Every implementation reflowed to one result column at 390
px. Qwen's incomplete result was therefore a workflow-completion failure, not a
broken-interface failure.

## Route observations

### Codex + GPT-5.6 Sol

- Full 100-point result in 350.694 seconds.
- Fewest tool calls among successful routes: 11.
- Four meaningful student tests and a polished wide-row visual design.
- Reported 598,240 input tokens and 14,423 output tokens; 541,696 input tokens
  were marked cached. Cost was not exposed by the subscription CLI.
- Tried optional lint and browser checks after the required tests. Two commands
  failed, but it reported the browser limitation accurately and did not claim
  unobserved behavior.

Codex's strongest differentiator in this run was economy of action: it reached
the same quality score with half Kimi's tool calls and one quarter of Opus's.

### OpenCode + Kimi K3

- Full 100-point result and fastest successful time: 221.644 seconds.
- Eight meaningful student tests.
- Twenty tool calls. OpenCode denied two broad shell commands, and Kimi
  recovered with its allowed read and glob tools.
- Reported 337,447 total tokens including cache reads, and cost `$0.5790162`.
- First edit arrived late, at 183.171 seconds, but the four writes and required
  test then completed quickly.

For this one task, Kimi K3 offered the best measured time/cost combination among
successful routes. This is useful evidence for OpenCode as a model-routing
harness, not proof that it will win across repositories or task types.

### Claude Code + Opus 5

- Full 100-point result in 483.388 seconds, the slowest successful route.
- Ten student tests, including direct interface wiring through a small document
  stub, and the most detailed final report.
- Forty-four tool calls and seven denied optional scratch or lint commands.
- Reported 1,704,740 processed input/output tokens when cache creation and cache
  reads are included.
- The CLI reported `$2.473437`, but its rate-limit record says overage was
  disabled and not in use. Treat this as equivalent-cost telemetry, not billed
  metered spend.

Claude Code's clearest strength was depth of verification and explanation. The
tradeoff was substantially more tool activity and the longest successful time.

### OpenCode + Qwen3.8-27B

- Hit the exact 20-minute timeout with no rerun or intervention.
- Spent 1,047.243 seconds before its first write.
- Completed the JavaScript, HTML, and CSS, but never changed
  `student-tests.mjs` and never produced a final report.
- The saved interface works, passes the four committed feature tests, and passes
  browser QA. It fails one private check because it declares zero student tests.
- Reported 266,170 total tokens and `$0.1518036`.

The smaller Qwen model was inexpensive but not efficient on this task. Low API
cost did not compensate for 20 minutes of wall time and an incomplete workflow.
It may still be suitable for narrow, well-specified subtasks after a frontier
model has reduced the problem, but this result does not support using it as the
autonomous owner of a complex UI change.

## Fable 5 access limitation

The exact `claude-fable-5` route was recognized by Claude Code but returned HTTP
429 before inference because usage credits are disabled. It used zero tokens
and cost `$0`. Opus 5 is reported as the best accessible Claude route, not as a
silent Fable substitution. A Fable result requires a separately preregistered
addendum after the account setting changes.

## Spend

The two OpenRouter access checks and counted runs used `$0.758898` of the
approved `$1.50` ceiling, leaving `$0.741102`. No account spending limit was
increased.

Subscription and API costs are not directly comparable. Codex exposed no dollar
amount, while Claude exposed equivalent-cost telemetry even though overage was
not in use.

## What this says about the assistants

- **Codex:** strong quality with the lowest tool count and a distinctive,
  polished result. Its run was slower than Kimi and did not expose subscription
  cost or first-edit timing.
- **Claude Code:** strongest verification depth and reporting, but most tool
  calls and slowest successful completion.
- **OpenCode:** clearly worth exploring. With Kimi K3 it delivered the fastest
  full-quality result, enforced strict permissions, and exposed exact API cost.
  With Qwen it timed out, showing that harness quality cannot rescue every model
  choice.

The OpenCode verdict moves from “useful secondary tool” to **strong secondary
tool and serious pilot candidate**. Primary-tool adoption still needs repeated
tasks plus plugin, MCP, session, configuration, and repository-scale evidence.

## Next experiment

Use all three assistants in one controlled workflow:

1. Codex + GPT-5.6 Sol creates the plan and acceptance checklist.
2. OpenCode + Kimi K3 implements a bounded task from that plan.
3. Claude Code + Opus 5 reviews the patch and evidence without seeing private
   tests.
4. Kimi receives at most one bounded repair pass.
5. The private grader decides acceptance.

Compare that workflow with a solo frontier-model control on a new frozen task.
This directly tests whether expensive frontier reasoning can be concentrated in
planning and review while a cheaper hosted open model performs implementation.
