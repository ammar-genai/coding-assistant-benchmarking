# Frontier-first study focus

Decision date: 2026-08-23

Status: active direction for new benchmark blocks

## User direction

The project must not become mainly a comparison of open models. Its primary
purpose is to compare the strongest OpenAI and Anthropic coding systems. Open
models remain important as focused challengers and as lower-cost workers inside
distributed workflows.

Codex, Claude Code, and OpenCode are all first-class harnesses in scope. The
project must explicitly compare their surrounding tool behavior. OpenCode is
not merely the place where open models run; the final report must decide whether
OpenCode itself is worth adopting.

Completed benchmark evidence remains unchanged. This decision controls new
work and supersedes any earlier next-step note that proposed running many open
models before the frontier comparison.

## Core model set

### Primary frontier models

1. **OpenAI GPT-5.6 Sol through Codex.** OpenAI's current model resolver names
   `gpt-5.6-sol` as the latest recommended model. Use the strongest reasoning
   setting available to the user's Codex subscription and record the exact
   served model identifier when the product exposes it.
2. **Claude Fable 5 through Claude Code.** Anthropic identifies
   `claude-fable-5` as its highest-capability generally available model.
   Confirm that the user's Claude Code account can select it before the recorded
   block. If it requires additional usage credits, obtain explicit approval
   before spending them.

Claude Opus 5 is the practical fallback only when Fable 5 is unavailable or the
user declines additional credits. Anthropic recommends Opus 5 for complex
agentic coding and everyday frontier work. Do not silently substitute Opus for
Fable; record the access limitation and the user's decision.

Official references:

- [OpenAI GPT-5.6 Sol upgrade guidance](https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p6-sol.md)
- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Anthropic Claude Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5)

### Focused open-model set

1. **Kimi K3 through OpenCode** is the main large open-model challenger. It is a
   current 2.8T-parameter flagship aimed at complex coding and long-running
   agent work. Use exact model ID `openrouter/moonshotai/kimi-k3` if OpenRouter
   is the selected access path.
2. **Qwen3.8-27B through OpenCode** remains the small-model control. Its purpose
   is to measure how much capability can be obtained from a much smaller model,
   not to represent the strongest open model.

DeepSeek V4 Pro is the preferred alternate if Kimi K3 access, reliability, or
cost blocks the core run. GLM may be revisited later, but it is not part of the
core set now. This keeps the study focused instead of testing every strong open
model.

References:

- [Kimi K3 official technical blog](https://www.kimi.com/blog/kimi-k3)
- [Kimi K3 OpenRouter route](https://openrouter.ai/moonshotai/kimi-k3-20260715)
- [DeepSeek V4 Pro official release](https://www.deepseek.com/en/)
- [DeepSeek V4 Pro OpenRouter route](https://openrouter.ai/deepseek/deepseek-v4-pro)
- [Qwen3.8-27B official model card](https://huggingface.co/Qwen/Qwen3.8-27B)

## Headline experiment

Create a new task that none of the selected models has already seen. T4 should
be a realistic user-interface feature with desktop and mobile behavior,
accessibility requirements, visible automated tests, browser verification, a
strict file scope, and private acceptance checks.

The primary single-agent comparison should be:

1. Codex + GPT-5.6 Sol;
2. Claude Code + Claude Fable 5;
3. OpenCode + Kimi K3; and
4. OpenCode + Qwen3.8-27B as the small-model control.

DeepSeek V4 Pro may replace Kimi only after an access or budget decision, or be
added as an explicitly secondary row. Claude Sonnet 5, Kimi K2.7 Code, and
DeepSeek V4 Flash remain useful historical or lower-cost evidence but are not
the headline models.

Use each proprietary model in its native assistant. This measures the strongest
real product a developer would choose, not a same-model harness comparison. Use
OpenCode for both open models so their surrounding assistant stays fixed.

Run a separate controlled block with one shared model across Codex, Claude Code,
and OpenCode. That block isolates harness behavior, while the native-model block
measures the strongest complete product. Both are required because neither can
answer the other's question.

## Distributed experiment

After the single-agent T4 block, run two mirrored workflows:

1. GPT-5.6 Sol plans and integrates, the selected open worker implements a
   bounded task, and Claude Fable 5 reviews.
2. Claude Fable 5 plans and integrates, the same open worker implements, and
   GPT-5.6 Sol reviews.

Use Qwen for a small bounded worker task and Kimi K3 for the harder open-worker
task if the single-agent evidence supports those assignments. Separate Git
worktrees, owned files, acceptance checks, and private grading remain required.

## Reporting rule

The headline conclusion must lead with frontier-model quality and end-to-end
product effectiveness. Open-model results answer two narrower questions:

- How close can a top open model get?
- Which smaller model is useful as a cheaper bounded worker?

Do not turn the final report into a long catalog of open models. Four core model
routes are enough unless a recorded access failure requires the declared
alternate.
