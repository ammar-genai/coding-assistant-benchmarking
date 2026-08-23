# T4 shared-model harness comparison

Date: 2026-08-23

Protocol: `T4-shared-harness-2026-08-23`

Baseline: `8907158740ccca5d644e1e92a12ae6cf0b0ac249`

Task: `T4-run-explorer@1.0.0`

Shared route: `ollama/kimi-k2.7-code:cloud`

This is a one-run controlled harness pilot. It compares Codex, Claude Code, and
OpenCode around the same hosted model; it does not establish a general winner.

## Result

All three assistants produced working, scoped, responsive interfaces. OpenCode
was fastest, Claude Code was close, and Codex took longer and reported more than
twice as many tokens.

| Harness | Raw runner result | Contract result | Adjusted score | Time | Reported tokens | Tool calls |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Codex | Fail | Pass | 98 | 87.538 s | 265,808 | 7 |
| Claude Code | Fail | Pass | 100 | 54.480 s | 111,552 | 14 |
| OpenCode | Pass | Pass | 99 | 52.582 s | 111,830 | 13 |

The adjusted scores are rubric applications after isolating the grader defect.
The one- and two-point differences are descriptive, not evidence of a durable
quality ranking.

## Grader defect

The frozen private suite contains a source check that requires the CSS to match
`/\.outcome/i`. The written task requires visible outcome text but does not
require a class named `.outcome`.

- Codex rendered `Pass` and `Fail` with `.run-outcome` and failed that check.
- Claude rendered `pass` and `fail` with `.run-outcome` and failed that check.
- OpenCode rendered `Pass` and `Fail` with `.outcome` and passed that check.

This accidentally rewarded one class name. The raw results remain preserved,
the private suite was not edited after the runs, and neither failure was rerun.
Raw pass/fail therefore cannot be used to rank T4 functional correctness. A
future repeated T4 block must use a new task version and a behavior-based check.

## Browser QA

Each recorded patch was reconstructed from its saved diff and served from a
temporary checkout. All three passed:

- initial records and summary values;
- assistant and outcome filters, including a combined filter;
- empty-state behavior;
- reset to all/all/score sorting;
- time and known-cost ordering;
- visible keyboard focus after reset;
- desktop and 390 px layouts without horizontal page overflow; and
- console inspection with no warnings or errors.

Codex used one wide result column on desktop, Claude used two, and OpenCode used
three. All reflowed to one result column at 390 px. Codex lost one responsive-UI
point because the single desktop column used horizontal space less efficiently.

## Harness behavior

### Codex

- 87.538 seconds and 265,808 reported tokens.
- Seven successful shell commands and no denied tool calls.
- Used shell reads, four whole-file shell writes, and the visible test.
- Produced a concise and accurate final report.
- The CLI could not load model metadata, fell back to generic metadata, and
  emitted a very large stderr stream of repeated telemetry warnings involving
  the colon in the model tag.

### Claude Code

- 54.480 seconds and 111,552 tokens in its final usage summary.
- Fourteen tool calls: one Glob, five Reads, four Writes, and four Bash calls.
- First recorded write occurred 42.525 seconds after run start.
- The allowed test passed. Two extra lint/typecheck attempts were denied by the
  harness, adding avoidable permission friction.
- Reported `$0.768255`, but that is wrapper telemetry for the Ollama route and
  is not assumed to be an actual user charge.

### OpenCode

- Fastest at 52.582 seconds, with 111,830 reported tokens.
- Thirteen tool calls: three Bash, one Glob, five Reads, and four Writes.
- First recorded write occurred 24.192 seconds after run start.
- Two broad shell discovery commands were denied. The model recovered
  immediately by using Glob and Read, then ran the exact allowed test command.
- Produced no stderr output and reported zero cost. Zero is not treated as proof
  of zero underlying Ollama Cloud cost.

## Cost and token caution

The surrounding tools report usage and cost differently even with the same
model route. Claude reported a dollar estimate, OpenCode reported zero, and
Codex did not expose a dollar amount. These are harness telemetry differences,
not comparable provider bills.

Claude and OpenCode differed by only 278 total reported tokens. Codex reported
about 2.38 times their total, but its adapter and fallback model metadata may
affect counting. Repeat runs are required before treating that ratio as stable.

## OpenCode verdict so far

OpenCode is worth exploring. This run strengthens the case for **useful
secondary tool**: it was fastest, stayed in scope, recovered from strict
permissions, passed every automated check, worked in the browser, and produced
clean operational logs.

It is too early to call OpenCode a primary tool. The top-native Kimi K3 block,
the frontier-model comparisons, repeated runs, configuration effort, session
handling, plugins, MCP, and distributed-workflow evidence are still pending.
