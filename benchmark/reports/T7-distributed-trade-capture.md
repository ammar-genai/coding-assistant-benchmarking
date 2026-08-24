# T7 distributed securitized-product trade capture

Date: 2026-08-24

Product route: `/trade-capture`

## Result

The distributed workflow produced a complete, tested local trade-capture mock,
but it also showed why a frontier integrator and independent reviewer remain
important. Qwen completed its narrow UI assignment cheaply and cleanly. Kimi
K3 spent 30 minutes planning a broader workspace assignment without writing a
file. Codex therefore implemented the six missing workspace files. Claude Opus
then found two real high-severity workflow defects, which Codex repaired without
rerunning the review.

The result is accepted as a synthetic local mock with one open evidence gap:
visible browser QA could not be completed because the in-app browser failed to
bind a valid tab. It is not production, booking, pricing, settlement, or
regulatory software.

## Stage evidence

| Stage | Assistant + model | Outcome | Elapsed | Token telemetry | Cost label |
|---|---|---|---:|---|---|
| Architecture plan | Codex + GPT-5.6 Sol | Manual pass, read-only | 203.673 s | 142,102 input; 112,896 cached subset; 8,418 output incl. 4,404 reasoning | Subscription; no dollar telemetry |
| Plan challenge | Claude Code + Opus 5 | Approve with required changes | 319.008 s | 24 input; 50,878 cache creation; 337,789 cache read; 22,085 output incl. 14,437 thinking | `$1.2314075` subscription telemetry |
| Domain worker | Codex + GPT-5.6 Terra | Automatic fail; behavioral pass after harness audit | 161.146 s | 263,111 input; 238,848 cached subset; 8,144 output incl. 1,438 reasoning | Subscription; no dollar telemetry |
| Ticket worker | Claude Code + Sonnet 5 | Automatic fail; behavioral pass after grader audit | 1,085.797 s | 38 input; 48,682 cache creation; 655,691 cache read; 24,799 output incl. 15,724 thinking | `$0.5752952` subscription telemetry |
| Insights worker | OpenCode + Qwen3.8-27B | Pass | 181.703 s | 212,749 input; 7,355 output | `$0.1071646` metered OpenRouter |
| Workspace worker | OpenCode + Kimi K3 | Timeout; not graded; zero changed files | 1,800.260 s | 32,838 input; 175,232 cache read; 2,305 output; 5,279 reasoning | `$0.2648436` metered OpenRouter |
| Integration | Codex frontier host session | Implemented Kimi fallback and integrated workers | Not instrumented | Not exposed | Subscription |
| Final review | Claude Code + Opus 5 | Accept with findings; read-only | 336.766 s | 34 input; 88,176 cache creation; 804,017 cache read; 25,142 output incl. 12,718 thinking | `$1.9140135` subscription telemetry |

The recorded isolated stages total 4,088.353 seconds, or about 68 minutes, but
that excludes host-session integration and repair time. Token fields are kept
in each adapter's own definition and are not summed or ranked across clients.

## Worker assessment

### GPT-5.6 Terra through Codex

Terra completed the domain implementation and passed its visible behavior
suite. The automatic run failed because the first isolated-worktree harness had
no dependency link and the allowed typecheck wrote an unapproved incremental
artifact. The exact source patch integrated without repair. Later Opus review
did expose two domain omissions—monotonic lifecycle enforcement and required
date checks—which count as frontier post-review repairs.

### Sonnet 5 through Claude Code

Sonnet produced a complete accessible ticket in its single owned file. The raw
automatic result failed because a hidden source regex required an internal
variable named `hasErrors`; the implementation used `hasBookingErrors` with the
same behavior. The exact blob integrated. Post-review, Codex changed the ticket
to separate hidden pristine errors from Book eligibility, show the active edit
ID, and support a read-only booked-record state.

### Qwen3.8-27B through OpenCode

Qwen is the cleanest open-model result in this project. It completed the
strictly bounded insights component in 181.703 seconds for `$0.1071646`, changed
only the owned file, and passed typecheck, lint, and all three private checks.
Its exact blob integrated without repair and remained unchanged after final
review.

### Kimi K3 through OpenCode

Kimi is a preserved failure in this block. It read 24 files and formed a
detailed implementation plan, but never invoked a write tool before the
30-minute limit. It changed no files and cost `$0.2648436`. The run was not
rerun. All six workspace-owned files are correctly attributed to Codex
frontier implementation, not Kimi.

This does not erase Kimi's accepted T4 and T5 results. It shows that model
quality is task- and run-dependent, and that a broad CSS/state/composition
assignment was a poor bounded-worker contract for this run.

## What the assistants added

- **Codex** provided the architecture plan, repository control, worker-patch
  integration, Kimi fallback, product verification, and review repairs.
- **Claude Code** added an adversarial architecture challenge, delivered the
  Sonnet ticket worker, and used Opus for a genuinely useful independent final
  review.
- **OpenCode** provided the clearest hosted-model routing and metered telemetry.
  It carried both the Qwen success and Kimi timeout without hiding either.

OpenCode remains worth using as a secondary harness, but the T7 evidence argues
for small owned tasks, strict time limits, and a frontier fallback—not handing a
large critical path to an open model without checkpoints.

## Cost

- T7 metered OpenRouter spend: `$0.3720082`.
- T7 approved OpenRouter ceiling: `$4.00`.
- T7 unused approved headroom: `$3.6279918`.
- Cumulative measured OpenRouter spend through T7: `$1.7484880`.
- Anthropic values above are subscription CLI telemetry, not billed project API
  spend.
- Codex subscription inference exposed tokens but no comparable dollar amount.

No further paid call, provider-limit increase, usage-credit enablement, deploy,
or push was used.

## Independent review and repairs

Opus returned `ACCEPT WITH FINDINGS`: two high, five medium, and four low. The
two high findings were correct:

1. a booked trade could be edited and saved back to draft; and
2. Validate cleared the ticket, breaking the natural Validate → Book flow and
   showing fresh errors immediately after successful booking.

Codex fixed those defects and the related medium/low findings: pristine error
display, missing date-required validation, focus movement, edit identity, test
coverage, muted contrast, and Node's minimum type-stripping version. Booked
records still load as the frozen contract requires, but mutation controls are
read-only. The horizontal-scroll blotter remains because the product explicitly
permits a labelled internal scroll region at 390 pixels.

The review was not rerun. Its original evidence remains independent, and the
repair is validated by the repository gate rather than by changing the review
result after the fact.

## Decision

The architecture is viable, but assignment size matters more than the phrase
"open model." A narrow Qwen component succeeded for about eleven cents. A much
broader Kimi task timed out after costing about twenty-six cents and forced six
frontier-owned files. The frontier planner/reviewer pattern paid for itself here
because Opus caught defects after local tests were green.

For future distributed projects:

1. keep Sol or Opus on architecture and final risk review;
2. give Sonnet, Terra, Qwen, or Kimi small independent files with fast checks;
3. split state, composition, and visual-system work into separate checkpoints;
4. stop a worker that plans without an edit for too long; and
5. count fallback and post-review repair explicitly instead of calling the
   worker successful because the final product works.
