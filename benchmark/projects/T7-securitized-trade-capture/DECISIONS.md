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
- Do not make paid OpenRouter calls until the user approves a fresh project
  ceiling. Recommended ceiling: `$4.00` across Qwen and Kimi combined.
- Do not publish or deploy without a separate user request.
