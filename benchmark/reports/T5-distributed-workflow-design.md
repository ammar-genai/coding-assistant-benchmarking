# T5 distributed workflow design

Date: 2026-08-23

Protocol: `T5-distributed-workflow-2026-08-23`

## Question

Can a top frontier model define the work, a second frontier product catch plan
mistakes, and a top hosted open model do the implementation—without losing the
quality of one frontier assistant doing the whole task?

The experiment uses all three primary coding assistants in one recorded
workflow:

1. Codex with GPT-5.6 Sol writes a read-only implementation plan.
2. Claude Code with Claude Opus 5 checks and corrects that plan.
3. OpenCode with Kimi K3 implements the frozen task.
4. Codex integrates the patch and runs the visible gate.
5. Claude Code performs a final independent, read-only review.
6. The harness runs the frozen visible and private checks.

A fresh Codex/GPT-5.6 Sol session then implements the same task alone from the
same Git baseline and unaugmented task prompt.

## Why the stages are measurable

The workflow recorder preserves each prompt, raw transcript, structured
telemetry, handoff text, changed paths, visible test result, and patch. It saves
the OpenCode worker patch before Codex integration, so the report can say
whether Kimi completed the work itself or whether the frontier integrator did.
Read-only planning and review stages are checked for workspace changes.

The assistants never see the private suite. Private grading occurs only after
the final review. A failure or timeout is preserved rather than rerun.

## Cost boundary

Only the Kimi K3 worker is a new metered API call. The lifetime OpenRouter cap
remains $1.50, with $0.741102 available before this block. There is no paid
repair call, no Qwen call, no provider-limit increase, and no Anthropic usage
credit. Codex and Claude subscription telemetry is reported separately from
metered spend.

## Decision boundary

The distributed pattern is promising only if it passes the same checks as the
solo control and the saved handoffs make the result easier to audit or allocate
to a lower-cost worker. More stages will almost certainly take longer, so elapsed
time is treated as a real cost rather than hidden by the final score.
