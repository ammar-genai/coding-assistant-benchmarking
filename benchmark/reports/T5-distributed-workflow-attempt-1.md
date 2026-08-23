# T5 distributed workflow — attempt 1

Date: 2026-08-23

Protocol: `T5-distributed-workflow-2026-08-23`

Outcome: stopped before the paid worker.

## What happened

Codex/GPT-5.6 Sol completed the read-only lead plan in 76.778 seconds without
changing the worktree. Claude/Opus 5 then inspected the task, visible tests,
stubs, and lead plan. Near the 10-minute limit it produced a detailed review as
the input to a `Write` tool targeting Claude Code's user plan directory.

That tool was intentionally unavailable because the stage was read-only.
Claude's special `plan` permission mode nevertheless tried to save a plan file,
the call failed, and the session did not return the review as final text before
the 600-second timeout.

The workflow's stop rule worked:

- no task file changed;
- no private check was exposed;
- OpenCode and Kimi were not started;
- OpenRouter cost was $0; and
- the failed stage and raw partial transcript were preserved.

## Why this matters

This is a harness result, not a model-quality verdict. Opus generated useful
analysis, but Claude Code's plan-file behavior conflicted with the intentionally
read-only adapter. It shows why assistant comparisons must include permission
and mode behavior instead of scoring only the text a model can produce.

## Versioned correction

The v2 protocol changes only the Claude read-only adapter and its stage limit:

- use `dontAsk` rather than special `plan` mode;
- expose only read tools, plus the exact visible test in final review;
- explicitly require review text in the response rather than a plan file; and
- allow 900 seconds for each Opus review stage.

The original attempt is not rerun or overwritten. V2 is a separate block, uses
fresh non-persistent sessions, and retains the same frozen T5 task and budget.
