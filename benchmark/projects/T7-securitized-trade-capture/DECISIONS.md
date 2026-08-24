# Project decisions

## 2026-08-23 — project shape

- Build the mock inside the existing application at `/trade-capture`.
- Preserve the benchmark dashboard at `/`.
- Use synthetic local data and React state only.
- Treat regulatory fields as realistic vocabulary, not a compliance claim.
- Use GPT-5.6 Sol and Opus 5 for planning/review.
- Use GPT-5.6 Terra as the mid-level OpenAI implementation model. Current
  official OpenAI guidance positions Terra as the GPT-5.6 balance of
  intelligence and cost.
- Use Sonnet 5, Qwen3.8-27B, and Kimi K3 for the other bounded implementation
  tasks.
- The user approved a fresh `$4.00` combined OpenRouter ceiling for the Qwen
  and Kimi implementation stages on 2026-08-23. Stop before any call that could
  take cumulative T7 OpenRouter spend above that amount.
- Do not publish or deploy without a separate user request.

## 2026-08-24 — independent-review repairs

- Preserve the Opus `ACCEPT WITH FINDINGS` review without rerunning it.
- Treat the booked-to-draft regression and Validate-clears-ticket behavior as
  real high-severity findings and repair them in the frontier integration.
- Keep the frozen ability to load a booked record into the ticket, but make all
  mutation actions read-only there; cancellation remains available in review.
- Add required date codes even though the original exception list was frozen,
  because the product contract already made both dates required. Version the
  implementation contract to 1.0.1 and record the correction.
- Hide pristine field errors until ticket interaction while continuing to
  compute validation and disable Book from the first render.
- Do not spend more OpenRouter credit or rerun any failed worker or reviewer.
