# Phase 1 brief

## Bottom line

Phase 1 supports a clear working setup:

- **Codex is the default lead and integrator.** It was strong, controlled, and
  efficient on complex implementation and repository integration.
- **Claude Code is the independent reviewer and alternate lead.** Its biggest
  contribution was review depth: Opus found important plan gaps and two real
  high-severity trade-capture defects that green local tests missed.
- **OpenCode is worth keeping as a strong secondary tool.** It was the best
  hosted-model router in the study, with good permission controls and direct
  OpenRouter cost telemetry.
- **Top open models are useful workers, not automatic replacements.** Kimi K3
  scored 100 on the complex T4 UI and completed T5 without repair. Qwen passed a
  narrow T7 component. But Qwen timed out on broader T4 work, and Kimi timed out
  on T7 after 30 minutes without writing a file.

## Key numbers

| Evidence | Result |
|---|---|
| T6 frontier bug fix | Codex/Sol 99 in 129.209 s; Claude/Opus 97 in 228.453 s; both correct |
| T4 top-native UI | Sol, Opus, and Kimi K3 all scored 100; Kimi was fastest at 221.644 s |
| T5 distributed workflow | 100 in 536.704 s with zero worker repair |
| T5 solo Codex control | 100 in 150.206 s |
| Distribution overhead | 3.57 times the solo elapsed time, with no score gain |
| T7 narrow Qwen worker | Pass in 181.703 s for `$0.1071646` |
| T7 broad Kimi worker | Timeout in 1,800.260 s, zero files, `$0.2648436` |

## What we learned

Use one strong frontier assistant for normal work. Add a second frontier model
when independent challenge or review matters. Give cheaper or open models small,
explicit, non-overlapping tasks with an early-edit checkpoint, hard timeout,
and frontier fallback.

The assistants should collaborate through repository files: shared
instructions, frozen task contracts, isolated worktrees, patches, structured
results, and repeatable checks. Skills, plugins, and MCP are useful convenience
layers, but the core workflow should remain portable.

The study's counted main-block OpenRouter ledger is `$1.7484880`. Including
three earlier Qwen setup/pilot line items gives `$1.9219742` of total recorded
OpenRouter-reported charges. Subscription telemetry and cross-client token
totals are not directly comparable.

Most routes ran once, so this is a high-quality pilot, not a statistical
reliability ranking. The trade-capture mock passed the repository gate, but its
formal browser QA remains unverified in the benchmark record.

## Next

Phase 2 is a neutral Pi comparison with the harness held constant. Compare the
top accessible OpenAI and Anthropic models with Kimi K3, Qwen3.8-27B, and one
leading DeepSeek or GLM route across repository analysis, bounded coding, and a
hard debugging/integration task. Freeze prices, budget, permissions, order,
timeouts, and repeated-run count before spending anything.

See the [executive report](PHASE-1-EXECUTIVE.md) or
[comprehensive report](PHASE-1-COMPREHENSIVE.md) for more detail.
