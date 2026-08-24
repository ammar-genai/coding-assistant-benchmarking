# Portable extension invocation pilot

Audit the saved run
`2026-08-23T18-22-22.767Z_codex_T6-rejected-promise-cache`.

Use the repository's `benchmark-audit` skill and only the two tools from the
`benchmark-audit` MCP server. Do not use shell, file, Git, web, browser,
subagent, mutation, or any other repository tool.

Call each MCP tool exactly once:

1. Call `get_task_contract` with task ID `T6-rejected-promise-cache`.
2. Call `summarize_run` with the exact run ID above.

Base the answer only on the returned tool data. Do not inspect raw prompts,
transcripts, patches, logs, or private tests.

Return exactly these four Markdown headings:

## Verdict

State pass, fail, invalid, or insufficient evidence.

## Evidence

Report the baseline commit, both prompt-match flags, changed and out-of-scope
paths, visible and private verification summaries, and artifact presence.

## Telemetry

Report assistant, model, access path, and elapsed time. Say that comparable
token and metered-cost totals are not supplied by these MCP results.

## Limitations

State what was not inspected and any conclusion the evidence cannot support.
