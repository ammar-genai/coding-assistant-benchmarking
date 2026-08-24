# Phase 2: neutral Pi model comparison

Status: protocol and access setup complete; no counted Phase 2 model calls yet

Phase 2 holds the coding harness constant and varies only the model route. It is
separate from Phase 1, which compared Codex, Claude Code, and OpenCode as
products.

## Core question

When Pi, tools, prompts, baselines, timeouts, and grading are held constant, how
do the strongest accessible frontier and open-weight models compare on analysis,
bounded implementation, and difficult concurrent debugging?

## Core models

1. OpenAI GPT-5.6 Sol
2. Anthropic Claude Fable 5
3. Moonshot Kimi K3
4. Qwen3.8-27B
5. Z.ai GLM 5.2

Claude Opus 5 is the preregistered fallback only if Fable fails its access check
before a counted run. DeepSeek V4 Flash is excluded from the core five because
Phase 1 already contains substantial shared-harness evidence for it; GLM adds a
new top open-weight family.

See [PROTOCOL.md](PROTOCOL.md) for the frozen design and
[ACCESS-AND-BUDGET.md](ACCESS-AND-BUDGET.md) for the credential and spend gate,
and [VALIDATION.md](VALIDATION.md) for the no-inference verification record.
