# Independent final review: securitized-product trade capture mock

Review the completed local mock at `/trade-capture` as the independent frontier
reviewer. This is a read-only evidence review. Do not edit files, run commands,
use the network, change Git state, or read `benchmark/private` or
`benchmark/runs`.

Read these contracts first:

- `benchmark/projects/T7-securitized-trade-capture/PRODUCT.md`
- `benchmark/projects/T7-securitized-trade-capture/ARCHITECTURE-SOL.md`
- `benchmark/projects/T7-securitized-trade-capture/ARCHITECTURE-OPUS-REVIEW.md`
- `benchmark/projects/T7-securitized-trade-capture/CONTRACT.md`
- `benchmark/projects/T7-securitized-trade-capture/DECISIONS.md`
- `benchmark/projects/T7-securitized-trade-capture/IMPLEMENTATION-LOG.md`

Then inspect the completed source under `app/trade-capture`, the route at
`app/trade-capture/page.tsx`, and the public tests under `tests`. Review only
what the files support; do not infer production readiness.

Evaluate:

1. Fidelity to the product and architecture contracts.
2. Domain and state correctness, especially lifecycle transitions, allocation
   tolerance, cancellation, selected-trade state, and audit history.
3. Whether the ticket, insights, blotter, and review compose into a coherent
   usable workflow.
4. Accessibility and responsive-layout risks visible in source.
5. Test coverage gaps and maintainability risks.
6. Whether the implementation log labels model output, frontier fallback,
   telemetry, cost, failures, and browser-QA limitations honestly.

Return exactly these sections:

- `Verdict`: `ACCEPT`, `ACCEPT WITH FINDINGS`, or `REJECT`, followed by one
  sentence.
- `Findings`: numbered, highest severity first. Each finding must include
  severity (`critical`, `high`, `medium`, or `low`), a file path, and concise
  evidence. Write `None` if there are no findings.
- `Contract coverage`: a compact list of what is demonstrably covered.
- `Evidence limits`: facts that remain unverified.
- `Recommended next actions`: at most five concrete actions, ordered by value.
