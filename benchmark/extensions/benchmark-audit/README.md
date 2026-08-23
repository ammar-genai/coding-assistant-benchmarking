# Portable benchmark-audit extension

This pilot gives Codex, Claude Code, and OpenCode the same small read-only
benchmark evidence boundary.

## Components

- `workflow.md` is the product-neutral audit procedure.
- `server.mjs` is a dependency-free local MCP server over stdio.
- `.agents/skills/benchmark-audit/SKILL.md` is the Codex/OpenCode discovery
  wrapper.
- `.claude/skills/benchmark-audit/SKILL.md` is the Claude Code wrapper.
- `config/` contains client-specific examples. Replace `<repo-root>` with an
  absolute path before using one.

The MCP server exposes only:

- `get_task_contract`, which returns scope, checks, prompt digest, and rubric;
- `summarize_run`, which returns manifest, prompt-integrity, scope, artifact,
  and verification facts.

It does not expose mutation tools, raw transcripts, raw prompts, credentials,
or private test contents. This is an application-level read-only design, not an
operating-system sandbox; keep normal client permissions enabled as well.

## Verify

```bash
npm run benchmark:mcp:test
```

The test launches the real stdio process, negotiates MCP, lists its tools, calls
both tools against a temporary fixture, confirms artifact and prompt-integrity
summaries, and checks traversal and extra-field rejection.

## Configure one client at a time

The repository does not enable this MCP server automatically. That keeps
existing counted benchmark lanes free of extension effects.

- Codex: copy the example into a selected Codex profile or use
  `codex mcp add benchmark-audit -- node <server-path> --root <repo-root>`.
- Claude Code: use the JSON example as a project `.mcp.json` or add the same
  stdio command with `claude mcp add --scope project --transport stdio
  benchmark-audit -- node <server-path> --root <repo-root>`. Project servers
  still require workspace trust/approval.
- OpenCode: merge the example's `mcp` entry into a dedicated pilot config. MCP
  tools consume context, so enable only this small server for the comparison.

Run client discovery and audit behavior as a separately preregistered feature
block. Do not mix extension-enabled runs with the T1-T6 quality results.

Official configuration references:

- [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [OpenCode MCP](https://dev.opencode.ai/docs/mcp-servers/)
