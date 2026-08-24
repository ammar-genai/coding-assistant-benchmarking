# Distributed implementation log

## B1 — worker baseline

Commit: `3c450d0f3b4b34b2e45f72aaad0a8acbe22ec610`

The baseline contains the frozen product and architecture contracts, stable
types and ownership, compiling component/state stubs, the route shell, and
initial rendered and domain checks. `npm test`, typecheck, lint, and benchmark
contract validation passed before the first implementation worker.

## Terra domain worker

Run: `2026-08-23T22-12-10.984Z_codex_T7-trade-domain`

Model/access: GPT-5.6 Terra through the Codex subscription.

Elapsed: `161.146 seconds`.

Usage telemetry: 263,111 input tokens, 238,848 cached input tokens, 8,144
output tokens, including 1,438 reasoning-output tokens. These are Codex
subscription telemetry, not an API bill.

The run's automatic result is preserved as **fail**. Its visible domain suite
and private behavior suite passed, but the isolated worktree had no installed
dependencies for typecheck or lint. Running the permitted typecheck also
generated `tsconfig.tsbuildinfo`, which the task had not allowed. This is a
harness/baseline defect and remains counted; the run was not rerun.

The integrator reproduced the worker-owned source patch with `apply_patch`.
No domain source repair was required. In the primary workspace, the expanded
domain suite, typecheck, and lint all passed. This integrated state is B2 for
the remaining independent workers.

## Harness correction after Terra

Before any later implementation run, the isolated-worktree setup was corrected
to reuse the repository's existing `node_modules` through a worktree-local
symlink. The standard typecheck command was also made non-incremental so it
does not create an unapproved `tsconfig.tsbuildinfo` artifact. The original
Terra result remains unchanged and failed; this correction applies only to
later stages.

## Sonnet ticket worker

Run: `2026-08-23T22-19-50.198Z_claude_T7-trade-ticket`

Model/access: Claude Sonnet 5 through the Claude Code subscription.

Elapsed: `1,085.797 seconds`.

Claude telemetry reported 38 input tokens, 48,682 cache-creation input tokens,
655,691 cache-read input tokens, 24,799 output tokens including 15,724 thinking
tokens, no permission denials, and `$0.5752952` of subscription cost telemetry.
That number is not recorded as metered API spend.

The automatic result is preserved as **fail**. The worker changed only its
owned ticket file, and typecheck and lint passed. Two of three private checks
passed. The remaining source-based check incorrectly required the internal
variable name `hasErrors`; the component used `hasBookingErrors` while still
computing error severity, disabling Book, and displaying the required reason.

The integrator reproduced the exact worker blob (`00720b0…`) and made no source
repair. The implementation is treated as a behavioral pass with a defective
hidden assertion, while the automatic benchmark result remains failed.

The harness now accepts an explicit baseline commit. Qwen and Kimi can therefore
start independently from the frozen `47ef930` baseline even after accepted
worker patches are committed to the integration branch.

## OpenRouter authorization

The user approved a `$4.00` combined OpenRouter ceiling for the Qwen and Kimi
stages on 2026-08-23. Spend is checked after Qwen before Kimi begins. Prior T7
OpenRouter spend was zero.

## Qwen insights worker

Run: `2026-08-24T00-17-57.308Z_opencode_T7-desk-insights`

Model/access: Qwen3.8-27B through OpenCode and OpenRouter.

Elapsed: `181.703 seconds`.

OpenCode telemetry reported 212,749 input tokens, 7,355 output tokens, no
separately labelled reasoning tokens, and `$0.1071646` of metered OpenRouter
spend. One exploratory `ls` was denied by the task policy; the worker recovered
with permitted tools.

The automatic result is **pass**. The worker changed only its owned insights
component, and typecheck, lint, and all private checks passed. The integrator
reproduced the exact worker blob (`c91f316…`) without repair. Remaining approved
T7 OpenRouter headroom before Kimi is `$3.8928354`.

## Kimi workspace worker

Run: `2026-08-24T00-22-18.335Z_opencode_T7-trade-workspace`

Model/access: Kimi K3 through OpenCode and OpenRouter.

Elapsed: `1,800.260 seconds` (30-minute timeout).

OpenCode telemetry reported 32,838 input tokens, 175,232 cache-read tokens,
2,305 output tokens, 5,279 reasoning tokens, and `$0.2648436` of metered
OpenRouter spend. Two exploratory shell calls were denied by the frozen tool
policy.

The run timed out and is **not graded**. It read 24 files, inspected the
contracts, and produced a detailed implementation plan, but it never called a
write tool and changed no files. It will not be rerun. Codex integration must
implement all six missing workspace-owned files, and those files count as
frontier implementation rather than Kimi output.

Combined T7 OpenRouter spend is `$0.3720082`, leaving `$3.6279918` of the
approved ceiling unused. No further paid run is required for this build.

## Codex frontier integration

Kimi produced no patch, so Codex implemented the six files assigned to that
worker: the reducer, selectors, application composition, blotter, selected-trade
review, and scoped visual system. These files are counted as frontier
implementation, not as Kimi output. Codex also added public state/workspace
tests, expanded the rendered-page checks, and connected the workspace suite to
the standard test command.

The completed mock supports deterministic local lifecycle transitions, live
validation, save/validate/book/edit/cancel/reset actions, filter/search/sort,
desk totals that exclude cancelled trades, accessible ticket/blotter/review
interactions, and synthetic audit history. It remains a local mock: no real
trade data, external booking, pricing, settlement, authentication, or
regulatory workflow was added.

One supporting visual asset was created with the built-in image generator and
saved as `public/trade-capture-structure.png`. The prompt requested a wide,
text-free institutional abstraction of mortgage pools, bond tranches, and
layered cash flows in navy and teal with restrained amber risk markers. The
asset is decorative and the product remains usable without it.

Integration verification passed:

- `npm run typecheck`
- `npm run lint`
- `npm test` (production build plus 11 public behavior/render checks)
- `npm run benchmark:validate`
- `git diff --check`

The four private Kimi workspace checks also pass against the integrated source.
Visible browser QA could not be completed because the Codex in-app browser
returned an invalid tab binding even after a fresh-tab recovery attempt. This
is recorded as an unverified presentation-layer gap, not as a product pass.

## Claude Opus independent final review

Run: `2026-08-24T01-01-26.172Z_claude_T7-trade-capture-final-review`

Model/access: Claude Opus 5 through the Claude Code subscription, read-only.

Elapsed: `336.766 seconds`. The run changed no files, used no network or shell
commands, and had no permission denials.

Claude telemetry reported 34 input tokens, 88,176 cache-creation input tokens,
804,017 cache-read input tokens, 25,142 output tokens including 12,718 thinking
tokens, and `$1.9140135` of subscription cost telemetry. It is not counted as
metered API spend.

The verdict is **ACCEPT WITH FINDINGS**. The raw review reports two high, five
medium, and four low findings. The two high findings were valid: booked trades
could regress to draft, and Validate cleared the ticket before Book. The review
also correctly identified pristine error display, missing required-date checks,
focus movement, hidden edit identity, test gaps, muted-text contrast, and the
minimum Node version mismatch. It explicitly kept browser behavior and all raw
run telemetry outside its verified claims.

## Post-review frontier repairs

Codex repaired the accepted findings without rerunning Opus:

- lifecycle functions now reject mutations of booked/cancelled records and do
  not write a validated status when errors exist;
- Validate and Save keep the working ticket populated, while successful Book
  clears it without announcing errors for a new untouched draft;
- pristine field errors remain hidden until interaction, but Book is disabled
  from the first render based on the full validation result;
- booked records may still load under the frozen contract, but ticket mutation
  controls become read-only and the active trade ID is visible;
- validated records cannot be saved backward to draft; changes must be
  revalidated before booking;
- trade and settlement dates now have explicit required exceptions;
- Edit and Cancel move focus to the appropriate heading after state updates;
- regression coverage now includes illegal transitions, required dates,
  Validate-to-Book, reset, edit guards, sort tie-breaking, and key rendered
  accessibility attributes;
- muted text contrast was increased, the Node minimum was corrected to 22.18,
  and TypeScript now restricts test-imported syntax to erasable forms.

The focused post-review gate passed typecheck, lint, the production build, all
12 public tests, all four frozen workspace checks, and `git diff --check`.

After the dashboard and reports were updated, `npm run verify` passed the full
repository gate: typecheck, lint, production build, 12 product/render tests,
four benchmark-audit MCP tests, and benchmark contract validation. The frozen
workspace checks and `git diff --check` also passed. The final-review prompt
hash matches its preregistered task prompt, and the review snapshot changed no
files. Browser QA remains the only unverified gate.
