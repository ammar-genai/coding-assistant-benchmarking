# Claude MCP permission recovery

Date: 2026-08-23

## Result

The narrow recovery passed. Claude Code 2.1.241 with Opus 5 loaded the shared
skill, connected the MCP server, executed each required read-only tool exactly
once, used no other tool, received no permission denial, preserved the
workspace, and returned an accurate audit.

The run took 24.198 seconds. Its only change from the preserved failed lane was
adding these exact names to `--allowedTools`:

- `mcp__benchmark-audit__get_task_contract`
- `mcp__benchmark-audit__summarize_run`

The prompt, target run, model, subscription route, `dontAsk` mode, strict MCP
configuration, available tool list, 600-second cap, and zero-intervention rule
were unchanged.

## Finding

For this Claude Code non-interactive setup, `--tools` made the MCP operations
visible but did not authorize their execution under `dontAsk`. Adding the same
two names to `--allowedTools` authorized only those operations and removed both
denials without widening the tool surface or permission mode.

This distinction should be part of the harness checklist:

1. Was the extension discovered?
2. Did the MCP process connect?
3. Were its tools made available to the model?
4. Were those tools authorized to execute?
5. Did each tool return a successful result?

Checking only connection or tool-use attempts would have produced a false
positive. The corrected feature runner now checks tool-result errors as well.

## Controlled comparison

| Field | Original frozen lane | Recovery lane |
|---|---:|---:|
| Result | Fail | Pass |
| Elapsed | 22.921 s | 24.198 s |
| Skill invocations | 1 | 1 |
| MCP attempts | 2 | 2 |
| MCP successes | 0 | 2 |
| Permission denials | 2 | 0 |
| Unexpected/fallback tools | 0 | 0 |
| Workspace changes | 0 | 0 |

The recovery emitted 6 input tokens, 9,402 cache-creation tokens, 18,920
cache-read tokens, 1,733 output tokens, and 208 thinking tokens under Claude's
definitions. The CLI displayed `$0.148095`; because this was a Claude
subscription session, that value is telemetry rather than metered API spend.

## Decision

The portable extension is ready for **controlled opt-in use** across all three
assistants. It should not be enabled automatically in benchmark lanes, because
adding a skill or MCP server changes the model's context and tool surface.
Continue to use isolated configuration for feature trials and deliberate
project sessions.

The original failure remains valid setup and permission evidence. The recovery
does not replace or erase it.

No OpenRouter request occurred. Cumulative OpenRouter spend remains
`$1.3764798`, leaving `$0.1235202` under the approved ceiling.
