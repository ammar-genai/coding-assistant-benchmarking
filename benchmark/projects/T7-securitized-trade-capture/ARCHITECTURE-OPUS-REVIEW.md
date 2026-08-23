# Frontier architecture review

Reviewer: Claude Code + Opus 5

Run ID: `2026-08-23T22-01-06.339Z_claude_T7-trade-capture-plan-review`

Elapsed: `319.008 seconds`

Verdict: **approve with required changes**

Status: read-only pass; prompt hash matched; no workspace changes or permission
denials

## Required changes accepted

1. Replace the single materialization function with explicit draft, validate,
   book, and cancel lifecycle functions that preserve identity and audit history.
2. Add `editingTradeId` to application state and prevent cancelled-trade edits.
3. Freeze signed exposure and every desk-summary calculation.
4. Use `tests/trade-domain.test.mjs`, explicit `.ts` imports, `import type`, and
   `allowImportingTsExtensions` so Node and TypeScript agree.
5. Include the domain test in the ordinary `npm test` gate.
6. Keep worker verification to domain tests, typecheck, and lint; do not require
   network-sensitive builds inside worker stages.
7. Put reducer transitions and blotter selectors in pure importable modules so
   they can be tested without a browser.
8. Freeze exception codes and form-field IDs for reliable error association.
9. Keep allocations read-only in the first mock. Seed trades may contain them;
   newly entered trades may use an empty allocation list.
10. Add an integer-cent comparison helper for allocation totals.
11. Make seed timestamps and empty-draft values deterministic. Generate new IDs
    and audit times only inside event handling.
12. Require every route stylesheet selector to begin with `.tc-`.
13. Freeze a minimum accessible table, row-selection, validation-region, and
    disabled-book reason contract.
14. Establish two worker baselines: B1 contains stable types and compiling
    stubs; Terra replaces the domain stubs, and its accepted result becomes B2.
    Sonnet, Qwen, and Kimi then start independently from B2.

## Calculation definitions

- `signedExposure = buy ? grossPrincipal : -grossPrincipal`.
- `buyExposure` is the sum of positive signed exposure.
- `sellExposure` is the sum of negative signed exposure and remains negative.
- `netExposure = buyExposure + sellExposure`.
- Desk `grossPrincipal` is the sum of absolute signed exposure.
- Active count excludes cancelled trades.
- Booked count includes only booked trades.
- Exception count includes error-severity exceptions on non-cancelled trades.

## State and component clarifications

- Live validation recomputes on every ticket change.
- Validate also writes a validated record and appends an audit event.
- Book always revalidates before committing.
- The blotter receives the full trade collection and applies the pure shared
  selector internally.
- After cancelling a selected trade, selection remains on that preserved record
  and focus returns to the review heading.
- Row selection uses a real button with `aria-pressed`, not a clickable row.
- The blotter uses a caption and a labelled focusable scroll region.
- Validation uses a `role="status"` live region.
- Book uses the native disabled state plus a visible reason.

## Worker baseline correction

B1 must contain stable types, route composition, package/TypeScript test wiring,
and compiling stubs for every worker-owned file. Terra starts from B1. Its
accepted patch is integrated and committed as B2. Sonnet, Qwen, and Kimi then
start from B2, so their imports resolve while their file ownership remains
non-overlapping.

## Verification additions

- lifecycle and illegal-transition tests;
- audit preservation across edit, book, and cancel;
- deterministic filter, search, sort, and tie-breaking tests;
- seed exceptions generated from current validation;
- cancelled trades excluded from summary totals;
- route assertions for labels, described errors, status region, caption, and
  synthetic notice;
- negative assertion that the benchmark homepage contains no `tc-` markup; and
- later manual checks for interaction, focus, console, reload reset, desktop,
  and 390-pixel layout.

## Telemetry note

Claude Code reported `$1.2314075` of subscription CLI telemetry. Anthropic usage
credits were not enabled, so it is not counted as metered project spend.
