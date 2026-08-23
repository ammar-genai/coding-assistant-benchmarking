# Top-model access check

Checked: 2026-08-23

Purpose: verify installed tools, authentication state, and visible model routes
without making a benchmark or paid inference call.

## Tool versions

| Tool | Version |
| --- | --- |
| Codex CLI | `0.146.0-alpha.3.1` |
| Claude Code | `2.1.241` |
| OpenCode | `1.18.21` |
| Pi | `0.84.2` |
| Ollama client | `0.32.3` |

## Authentication and routes

### Codex

`codex login status` reports `Logged in using ChatGPT`.

The CLI accepts an explicit `--model` value. The planned top route is
`gpt-5.6-sol`, based on the official OpenAI current-model resolver. A later
minimal access check should confirm that this subscription can serve it and
whether the event stream exposes the exact served-model identifier.

### Claude Code

`claude auth status` now reports an active first-party `claude.ai` session on
the user's Pro subscription. The CLI is Claude Code `2.1.241`.

The CLI accepts `--model claude-fable-5` as well as the `fable`, `opus`, and
`sonnet` aliases, and exposes effort settings through `--effort`. This confirms
that the installed harness can request the planned route; it does not prove
that Fable is included in this particular subscription. No inference request
was made, so no usage credits were consumed. Before a recorded run, make one
minimal access request and record whether Fable is included or requires usage
credits. Do not spend usage credits without explicit approval. If Fable is not
available under the approved access path, use the declared `claude-opus-5`
fallback and record the reason.

### OpenCode and OpenRouter

`opencode auth list` reports one OpenRouter API credential without displaying
the secret. The OpenCode model catalog exposes:

- `openrouter/moonshotai/kimi-k3`;
- `openrouter/qwen/qwen3.8-27b`;
- `openrouter/deepseek/deepseek-v4-pro`; and
- `openrouter/deepseek/deepseek-v4-pro-0813`.

Qwen3.8-27B has already passed connectivity, T1, and T2 checks. Kimi K3 and
DeepSeek V4 Pro have not been called through this account. Their first request
must be a minimal access check after confirming current price and the spending
limit.

The price check was refreshed immediately after the T4 shared-model block:

- Kimi K3 is listed at `$2.60` per million input tokens and `$13.00` per
  million output tokens, with `$0.29` per million cache-read tokens. The route
  has multiple providers and a 1,048,576-token context window.
- Qwen3.8-27B is listed at `$0.40` per million input tokens and `$3.00` per
  million output tokens, with provider-dependent cache-read pricing.

Sources:

- <https://openrouter.ai/moonshotai/kimi-k3-20260715>
- <https://openrouter.ai/qwen/qwen3.8-27b>

Using the shared T4 block's observed token scale only as a planning estimate,
one Kimi K3 T4 run should usually remain below `$1.00` and one Qwen3.8-27B run
below `$0.25`. These are safety estimates, not guarantees or recorded costs.

### Ollama Cloud

The local Ollama catalog currently contains the hosted routes:

- `kimi-k2.7-code:cloud`;
- `deepseek-v4-flash:cloud`; and
- `minimax-m2.5:cloud`.

It also contains local `qwen3:8b`, which is not a headline model. Kimi K2.7 Code
is the strongest currently verified identical shared route across Codex, Claude
Code, and OpenCode, so it remains the controlled three-harness model unless a
better identical route is verified.

## Current blocker

All required tools are installed and authenticated. Exact Fable 5 entitlement
remains deliberately untested because proving it requires an inference request
that could consume usage credits. This does not block task design or freezing a
clean benchmark baseline.

Anthropic currently lists Fable 5 at `$10` per million input tokens and `$50`
per million output tokens for API use. A T4 run at the shared block's observed
token scale would be roughly `$1.50`, but Claude Code subscription or usage-credit
accounting may differ. Require a separate user-approved ceiling before the
minimal access check and counted run.

Source: <https://platform.claude.com/docs/en/about-claude/models/overview>

## Exact-route access checks

The non-counted checks used a generic `ACCESS_OK` prompt and did not disclose
the benchmark task:

- Codex + `gpt-5.6-sol`: available through the subscription.
- OpenCode + `openrouter/moonshotai/kimi-k3`: available; reported cost
  `$0.0244644`.
- OpenCode + `openrouter/qwen/qwen3.8-27b`: available; reported cost
  `$0.0036138`.
- Claude Code + `claude-fable-5`: recognized, but inference did not start. The
  CLI returned HTTP 429 and said usage credits must be enabled. It reported zero
  tokens and `$0` cost.
- Claude Code + `claude-opus-5`: available through the current login; the CLI
  reported `$0.064167` in usage telemetry, which is not assumed to be an amount
  billed outside the subscription.

The two OpenRouter checks used `$0.0280782`, leaving `$1.4719218` of the
approved combined ceiling for their counted T4 runs. No spending limit was
increased. The top-native v2 protocol therefore uses Opus 5 as the separately
labeled best accessible Claude route and preserves Fable 5 as an access
limitation. Fable can be tested later in a distinct preregistered addendum if
the account setting changes.

Structured evidence:
[`T4-top-native-v2-access-checks.json`](T4-top-native-v2-access-checks.json).
