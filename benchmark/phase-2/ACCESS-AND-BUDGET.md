# Phase 2 access and budget gate

Date checked: 2026-08-23
Status: OpenRouter ready; `$18.00` Phase 2 ceiling approved

## Current Pi readiness

| Provider | Status |
|---|---|
| Ollama Cloud | Ready; Pi sees DeepSeek V4 Flash and GLM 5.2 |
| OpenRouter | Ready through Pi OAuth; exact five model routes visible |
| ChatGPT/Codex subscription | Not configured in Pi |
| Anthropic | Not configured in Pi |

The existing OpenRouter credential in OpenCode was not copied or exposed. Pi's
own `/login openrouter` OAuth flow created a user-controlled key in Pi's private
credential store, billed from the same OpenRouter account.

Pi's refreshed catalog now exposes:

- `openrouter/openai/gpt-5.6-sol`;
- `openrouter/anthropic/claude-fable-5`;
- `openrouter/moonshotai/kimi-k3`;
- `openrouter/qwen/qwen3.8-27b`; and
- `openrouter/z-ai/glm-5.2`.

## Conservative price snapshot

These are provider list-price inputs for budgeting, not guaranteed run costs.
Recheck the live Pi/OpenRouter catalog immediately before the access checks.

| Route | Input / 1M | Output / 1M | Source |
|---|---:|---:|---|
| GPT-5.6 Sol | `$5.00` | `$30.00` | OpenAI/OpenRouter list price; promotional routing may be lower |
| Claude Fable 5 | `$10.00` | `$50.00` | Anthropic/OpenRouter |
| Kimi K3 | `$2.60` | `$13.00` | OpenRouter |
| Qwen3.8-27B | `$0.40` | `$3.00` | OpenRouter |
| GLM 5.2 | `$0.50` | `$3.15` | OpenRouter |

Sources:

- <https://developers.openai.com/api/docs/models/gpt-5.6-sol>
- <https://platform.claude.com/docs/en/about-claude/models/overview>
- <https://openrouter.ai/openai/gpt-5.6-sol>
- <https://openrouter.ai/anthropic/claude-fable-5>
- <https://openrouter.ai/moonshotai/kimi-k3>
- <https://openrouter.ai/qwen/qwen3.8-27b>
- <https://openrouter.ai/z-ai/glm-5.2>

## Approved ceiling

- Phase 2 OpenRouter ceiling: `$18.00` including access checks, matching the
  confirmed available credit.
- Operational stop point: `$16.50` recorded spend.
- Reserved headroom: `$1.50` for delayed or final in-flight telemetry.
- No provider/account limit increase is authorized.

The user confirmed `$18.00` of available OpenRouter credit before execution.

## Access check

After approval, run one minimal no-tools fixed-response request per exact route.
Record the served model, provider, tokens, cost, and result. Access checks are
not quality results but their cost counts against the Phase 2 ceiling.
