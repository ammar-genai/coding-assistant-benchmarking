---
name: benchmark-audit
description: Audit saved coding-assistant benchmark runs and comparison blocks for prompt integrity, acceptance, scope, verification, telemetry labeling, and unsupported claims. Use when asked to review, validate, summarize, grade, or compare evidence under benchmark/tasks, benchmark/runs, or benchmark/blocks.
---

# Benchmark Audit

Read and follow `benchmark/extensions/benchmark-audit/workflow.md` from the
repository root.

Use the `benchmark-audit` MCP tools when configured. Fall back to local saved
artifacts when they are unavailable. Stay read-only, never open
`benchmark/private`, and do not expose raw transcripts unless the user
explicitly requests a bounded excerpt needed for the audit.
