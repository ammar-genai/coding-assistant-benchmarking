# Phase 1 executive report

Status: complete; larger neutral Pi comparison is the next phase

## Executive decision

| Question | Phase 1 answer |
|---|---|
| Codex versus Claude Code | Use Codex as the default lead and integrator. Use Claude Code as the independent reviewer and alternate lead. |
| Is OpenCode worth using? | Yes. Keep it as a strong secondary tool and the main hosted open-model router. |
| Frontier versus open models | Top open models can match frontier outcomes on bounded work, but their reliability drops when ownership becomes broad or ambiguous. |
| Frontier plan plus cheaper worker | The pattern works. T5's Kimi worker needed no frontier repair, but the distributed route was 3.57 times slower than solo Codex. |
| All three assistants together | Useful for separation of duties and auditability, not as the default for speed. |
| Plugins and shared tooling | Keep the real workflow portable in repository contracts, scripts, and read-only MCP; use product-specific skills/plugins as thin wrappers. |

## What was tested

The three primary assistants were Codex, Claude Code, and OpenCode. Pi was used
as an early neutral runner, not ranked as a fourth primary assistant.

Models included GPT-5.6 Sol and Terra; Claude Opus 5 and Sonnet 5; DeepSeek V4
Flash Cloud; Kimi K2.7 Code Cloud and Kimi K3; and Qwen3.8-27B. Fable 5 could
not be tested because usage credits were disabled, and local Qwen 8B remained a
side control because the 16 GB laptop was not suitable for large local models.

The work progressed from read-only repository analysis to small fixes,
multi-file implementation, a complex UI, a distributed feature, a subtle cache
incident, a portable cross-assistant audit extension, and finally a distributed
securitized-products trade-capture mock.

## Most important evidence

### Direct frontier comparison

On the difficult T6 rejected-Promise cache incident, both frontier routes were
correct:

| Route | Score | Time | Private checks | Tool calls / denials |
|---|---:|---:|---:|---:|
| Codex + GPT-5.6 Sol | 99 | 129.209 s | 8/8 | 7 / 0 |
| Claude Code + Opus 5 | 97 | 228.453 s | 8/8 | 29 / 10 |

Codex was 99.244 seconds faster and used a smaller execution trace. Claude
wrote broader tests and a more detailed incident report. This supports Codex
for controlled completion and Claude for independent challenge and review.

On T4's complex interface, Sol and Opus both scored 100. Codex finished in
350.694 seconds with 11 tool calls. Claude finished in 483.388 seconds with 44
tool calls and produced the largest test suite and deepest final evidence.

### OpenCode and open-model evidence

OpenCode produced several strong results:

- OpenCode + Kimi K3 scored 100 on T4 in 221.644 seconds, the fastest accepted
  top-native route, for `$0.5790162` metered cost.
- OpenCode + Kimi K3 implemented T5's five owned files, passed all corrected
  checks, and required zero Codex repair.
- With Kimi K2.7 held constant on T6, OpenCode scored 99 in 55.115 seconds,
  faster than Claude Code at 78.832 seconds and Codex at 93.662 seconds. All
  three passed all eight private checks.
- OpenCode + Qwen completed the tightly bounded T7 insights component in
  181.703 seconds for `$0.1071646` and integrated unchanged.

The limits were equally important:

- Qwen timed out after 1,200.289 seconds on the larger T4 interface. Its partial
  UI worked in browser QA, but it had no student tests or final report and was
  not an accepted run.
- Kimi K3 timed out after 1,800.260 seconds on T7's broad workspace assignment,
  cost `$0.2648436`, and wrote no files. Codex implemented the six-file fallback.

OpenCode is therefore worth using, but model choice and assignment size matter
more than the label “open source.”

### Distributed workflow

T5 used Codex/Sol for planning, Claude/Opus for plan challenge, OpenCode/Kimi
for implementation, Codex for integration, and Claude for final review.

| Route | Score | Time | Metered API cost | Frontier repair |
|---|---:|---:|---:|---:|
| Distributed three-assistant route | 100 | 536.704 s | `$0.6175818` | 0 edits |
| Solo Codex/Sol control | 100 | 150.206 s | Subscription; not exposed | Not applicable |

The architecture worked but did not beat the solo control on score, speed, or
simplicity. Use it when plan challenge, separate ownership, or an audit trail is
worth the 3.57-times time cost.

T7 demonstrated the higher-risk case where distribution did add value. Opus's
independent final review found two real high-severity workflow defects after
local checks were green: booked trades could regress to draft, and Validate
cleared the ticket before Book. Codex repaired them and completed the final
gate. The finished local application is a synthetic mock, not production
financial software.

## Recommended operating model

1. **Default work:** Codex + Sol plans, implements, integrates, and verifies.
2. **High-risk work:** Claude + Opus challenges the plan or performs a fresh
   final review.
3. **Mid-level bounded work:** Terra or Sonnet owns one explicit component with
   fast checks.
4. **Hosted open-model work:** OpenCode routes Kimi, Qwen, or DeepSeek to small,
   non-overlapping assignments.
5. **Control rule:** require an early first edit, use a fixed timeout, preserve
   failures, and keep a frontier fallback.

Use all three assistants only when the additional review and evidence are part
of the goal. For routine bounded changes, one capable frontier session is more
efficient.

## Harness, plugin, and interoperability conclusion

The assistants work together best through normal repository artifacts:

- shared instructions in `AGENTS.md`, with a thin `CLAUDE.md` shim if needed;
- frozen Markdown prompts and JSON acceptance contracts;
- isolated worktrees and non-overlapping file ownership;
- patches, structured results, and reports as handoffs; and
- required checks in repository scripts or CI.

The portable audit extension confirmed that one canonical workflow and a
read-only MCP server can serve all three products. Codex and OpenCode passed the
first invocation. Claude first failed because the two MCP calls were not
authorized, then passed in a separately frozen recovery with those exact tool
names preapproved. Product plugins should package convenience, not become the
only copy of the workflow.

## Cost and measurement

The final study's counted main-block OpenRouter ledger is `$1.7484880`: T4
`$0.7588980`, T5 `$0.6175818`, and T7 `$0.3720082`. Three earlier Qwen reports
also record `$0.1734862` of setup and pilot charges that are outside that later
cumulative field. Adding every visible OpenRouter-reported line item gives
`$1.9219742`. Reconcile the provider dashboard before quoting one external total.

Claude's dollar values are subscription CLI telemetry, not billed study API
spend. Codex did not expose a comparable subscription dollar value. Ollama
wrapper `$0` fields do not prove free underlying cloud inference.

Token totals should not be ranked across assistants because each adapter counts
cache, resent context, reasoning, and totals differently. Accepted outcome,
elapsed time, directly metered provider cost, tool friction, scope, tests, and
intervention are the reliable comparison dimensions in this pilot.

## Evidence limits

Most routes ran once, so the results show observed capability rather than
reliability. Raw grader and harness failures were preserved even when audits
proved the saved code behaviorally correct. T7 passed the repository gate, but
formal responsive/browser/console QA remains unverified in the benchmark record;
the later visual viewing of the app was not a counted QA run.

## Next phase

Phase 2 will be a larger neutral Pi model comparison with the harness held
constant. It should compare one top OpenAI model, one top Anthropic model, Kimi
K3, Qwen3.8-27B, and either DeepSeek V4 or the strongest accessible GLM route,
with an optional mid-level frontier control.

Freeze availability, current prices, spend ceiling, repeated-run count,
randomized order, timeouts, and identical permissions before any paid call.
Use repository analysis, bounded implementation, and difficult debugging or
integration tasks. Prefer repeated runs across a smaller model set over a
single run across many models.

For complete methodology and evidence links, see the
[comprehensive report](PHASE-1-COMPREHENSIVE.md).
