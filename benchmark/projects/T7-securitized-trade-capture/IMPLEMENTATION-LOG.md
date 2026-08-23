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
