# Portable benchmark-audit extension pilot

Date: 2026-08-23

Clients: Codex CLI `0.146.0-alpha.3.1`, Claude Code `2.1.241`, OpenCode
`1.18.21`

## Result

The first portable extension substrate is implemented and passes its no-model
checks. One product-neutral workflow and one dependency-free, read-only MCP
server can be configured separately in Codex, Claude Code, and OpenCode. Thin
skill wrappers avoid maintaining three copies of the audit procedure.

This pilot proves protocol behavior, configuration compatibility, and OpenCode
skill discovery. It does not yet prove that all three assistants will invoke
the skill and tools consistently during model inference.

## Design

- `workflow.md` defines the shared audit procedure and output contract.
- `.agents/skills/benchmark-audit/SKILL.md` provides the Codex/OpenCode-facing
  wrapper.
- `.claude/skills/benchmark-audit/SKILL.md` provides the Claude Code wrapper.
- `server.mjs` exposes two MCP tools over standard input/output:
  `get_task_contract` and `summarize_run`.
- The server returns normalized task, prompt-integrity, scope, artifact, and
  verification facts. It never returns raw transcripts, raw prompts,
  credentials, or private-test contents.
- Product-specific example configurations live under `config/`; the repository
  does not silently install them into a user's global configuration.

The MCP tools are read-only by implementation and declare read-only,
idempotent, closed-world annotations. This is an application boundary, not an
operating-system sandbox, so the client's normal permission controls still
matter.

## Verification

| Check | Result | Meaning |
|---|---|---|
| Skill structure validation | Pass for `.agents` and `.claude` wrappers | Both wrappers have valid names, descriptions, and instruction files. |
| MCP process test | 4/4 pass | A real child process negotiated MCP, listed exactly two tools, returned task/run summaries, and rejected traversal, extra arguments, and unknown tools. |
| Codex configuration | Parsed and enabled | `codex mcp list --json` accepted the isolated stdio definition. This was a configuration check, not a live model/tool call. |
| Claude Code connection | Connected | An isolated temporary `CLAUDE_CONFIG_DIR` listed `benchmark-audit` as connected. The user's normal Claude configuration was not changed. |
| OpenCode connection | Connected | `opencode mcp list` accepted an injected temporary configuration and connected without a model call. |
| OpenCode skill discovery | Discovered | `opencode debug skill --pure` found `benchmark-audit` from the repository wrapper. |
| Project verification | Pass | Type check, lint, application tests/build, MCP tests, and benchmark validation all passed. |

No assistant inference and no paid API request were used in this pilot.
OpenRouter spend therefore remains `$1.3764798`.

## Security and portability findings

MCP is the cleanest shared tool boundary: the same server process worked with
Claude Code and OpenCode and its Codex configuration parsed successfully. The
skill format is similar enough for one canonical workflow, but discovery paths
and product metadata still need thin wrappers. Full plugin packages are not
portable because each product has a different manifest, runtime, and hook
model.

The safest pattern for this project is therefore:

1. keep policy and benchmark truth in ordinary repository files and scripts;
2. keep one product-neutral workflow;
3. expose narrowly scoped, read-only evidence through MCP;
4. add only small product wrappers; and
5. test product-native plugins or hooks separately, never as benchmark truth.

## Limitations and next experiment

- Codex was checked only for configuration parsing; Claude Code and OpenCode
  were checked for live process connection.
- OpenCode was checked for skill discovery; Codex and Claude skill discovery
  was structurally validated but not exercised through model inference.
- No assistant was asked to call either MCP tool, so invocation reliability,
  added context/tokens, permission prompts, and output consistency remain open.
- The MCP server trusts the configured repository root and should still run
  under each client's filesystem and command restrictions.

That feature block is now complete. OpenCode and Codex invoked both tools
successfully; Claude Code discovered the skill and connected the server, but
its frozen `dontAsk` policy denied both calls. The preserved comparison and
grader correction are documented in
[`benchmark-audit-invocation-pilot.md`](benchmark-audit-invocation-pilot.md).

The next narrow recovery check should preauthorize only Claude's two MCP tools
while retaining `dontAsk` and the same read-only surface. Keep that result
separate from T1-T6 task-quality scores and from the original failed lane.

## Files

- `benchmark/extensions/benchmark-audit/README.md`
- `benchmark/extensions/benchmark-audit/workflow.md`
- `benchmark/extensions/benchmark-audit/server.mjs`
- `benchmark/extensions/benchmark-audit/server.test.mjs`
- `benchmark/extensions/benchmark-audit/config/`
- `.agents/skills/benchmark-audit/`
- `.claude/skills/benchmark-audit/`

Official configuration references:

- [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [OpenCode MCP](https://dev.opencode.ai/docs/mcp-servers/)
