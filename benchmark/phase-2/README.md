# Phase 2: neutral Pi model comparison

Status: complete and audited; all 20 counted Phase 2 observations are preserved

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

## Completed artifacts

- Machine-readable result block:
  `benchmark/blocks/phase-2-pi-model-comparison-2026-08-23.results.json`
- Full report: `benchmark/reports/phase-2/PHASE-2-COMPREHENSIVE.md`
- Executive report: `benchmark/reports/phase-2/PHASE-2-EXECUTIVE.md`
- Brief report: `benchmark/reports/phase-2/PHASE-2-BRIEF.md`
- Evidence audit: `benchmark/reports/phase-2/AUDIT.md`
- T8 manual grading: `benchmark/phase-2/T8-GRADING.json`
- Kimi T9 post-timeout patch audit:
  `benchmark/phase-2/KIMI-T9-POST-TIMEOUT-AUDIT.json`

Raw run directories remain local and Git-ignored under `benchmark/runs/`.
