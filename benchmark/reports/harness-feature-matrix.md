# Harness feature matrix: Codex, Claude Code, and OpenCode

Date: 2026-08-23  
Local versions: Codex CLI `0.146.0-alpha.3.1`, Claude Code `2.1.241`,
OpenCode `1.18.21`

## Result

The three tools overlap on the basics, but they are not interchangeable.

- **Codex is the best default lead for this project.** Its strongest
  differentiators are the operating-system sandbox and approval split,
  controlled non-interactive execution, the desktop app's worktree and browser
  workflow, and strong integration discipline in T5.
- **Claude Code is the strongest independent planner and reviewer observed so
  far.** It found seven useful plan gaps in T5 and returned a careful final
  review. Its documented customization surface is broad, especially hooks,
  subagents, plugins, MCP, and browser integration. Its special plan permission
  mode also caused a real automation timeout in this project, so permission
  modes must be tested rather than assumed.
- **OpenCode is worth keeping as a strong secondary tool and serious pilot
  candidate.** Its clearest advantages are provider/model choice, explicit
  permission patterns, session export, and visible token/cache/cost telemetry.
  Kimi K3 completed the whole T5 implementation without frontier repair. The
  Qwen T4 timeout shows that OpenCode results remain highly model-dependent.

This is not a general market ranking. It combines official feature
documentation with the project's own T1-T5 evidence and labels the difference.

## Evidence labels

- **Tested**: directly observed in this repository.
- **CLI checked**: present in the installed command help, but not behaviorally
  tested as a benchmark feature.
- **Documented**: present in current official documentation, but not yet tested
  here.
- **Gap**: no comparable first-party capability was established.

## Core harness comparison

| Area | Codex | Claude Code | OpenCode |
|---|---|---|---|
| Repository instructions | **Tested.** Reads `AGENTS.md`; supports layered global, repository, and nested instructions. | **Tested through shim.** This repo's `CLAUDE.md` imports `AGENTS.md`; Claude's native contract is `CLAUDE.md`. | **Documented; partly exercised.** Reads `AGENTS.md` and has `CLAUDE.md` fallback compatibility. |
| Model selection | **Tested.** Subscription frontier and shared Ollama routes worked; `--model` and `--oss` are installed. | **Tested.** Subscription frontier and shared Ollama routes worked; `--model` and fallback models are installed. | **Tested.** Ollama Cloud and OpenRouter routes worked through one checked-in provider config. This is the clearest provider-flexibility advantage. |
| Planning | **Tested as a read-only stage.** T5 planning completed without changes. First-party Plan mode is documented but was not isolated as its own feature trial. | **Tested with a failure and correction.** Special `plan` permission mode tried to write a user plan file and timed out in a read-only adapter. `dontAsk` plus an explicit read-only tool list completed. | **Documented.** A plan agent and custom agents exist; no isolated planning trial has been run. |
| File and command safety | **Tested.** Read-only/workspace modes, approvals, protected Git metadata, and isolated benchmark worktrees were effective. Codex also documents an OS-level sandbox. | **Tested.** Tool allowlists and denials worked, but plan-mode behavior revealed a mode/tool mismatch. The project has not established a directly comparable OS boundary. | **Tested.** `allow`/`ask`/`deny` patterns blocked unapproved Git and ad-hoc Bash commands while allowing exact test commands. The project has not established a directly comparable OS boundary. |
| Scope discipline | **Mixed evidence.** Clean in T4/T5; one T3 shared-model run generated `tsconfig.tsbuildinfo` outside scope. | **Clean in counted write runs.** Read-only T5 stages changed nothing. | **Clean in counted accepted runs.** The T5 worker changed exactly five allowed files. |
| Session resume and fork | **CLI checked.** `resume`; app/CLI chat forking is documented. | **CLI checked.** `--continue`, `--resume`, and `--fork-session`. | **CLI checked.** `--continue`, `--session`, and `--fork`. |
| Non-interactive/structured output | **Tested.** JSON events support the runner, with useful token/tool data. Exact served model was not exposed in one subscription run. | **Tested.** JSON and stream-JSON expose model, tool, cache, thinking, and cost telemetry. Subscription cost telemetry is not the same as billed spend. | **Tested.** JSON events exposed tool calls, denials, cache tokens, provider cost, and exact model route. `export` and `stats` are also installed. |
| Error clarity and recovery | **Tested.** Runner failures and acceptance failures were separable; integration avoided unnecessary repair. | **Mixed.** Rich telemetry helped diagnose the T5 timeout, but the plan-file tool attempt did not terminate promptly. The corrected adapter worked. | **Mixed.** Permission denials were explicit and a partial Qwen patch was preserved after timeout; model/tool loops can still consume the full limit. |
| Parallel agents/delegation | **Documented.** Current app/CLI/IDE releases support inspectable subagents. Not tested inside a counted run. | **Documented.** Built-in and custom subagents, background agents, and agent teams are available. Not tested inside a counted run. | **Documented.** Primary/subagent roles and custom agents are available. Not tested inside a counted run. |
| Worktree isolation | **Documented first-party app support; tested through our neutral runner.** | **Documented in Desktop; tested through our neutral runner.** | **Neutral runner only in this study.** Plugin/tool context exposes a worktree, but an equivalent automatic isolation workflow has not been validated. |
| Browser and visual verification | **Documented first-party app browser and computer use.** The T4 comparison used external browser QA, so native advantage is not yet counted. | **Documented.** Chrome integration is beta; Desktop also has an embedded preview and visual verification. Not yet tested in a controlled block. | **Gap for native browser control.** `opencode web` is an interface for OpenCode sessions, not evidence of web-app automation. Use the same external QA or a shared MCP server for fair tests. |
| Cloud/remote continuation | **Documented through app/cloud surfaces.** Not tested here. | **Documented.** Web sessions, `--cloud`, Remote Control, and teleport are available. Not tested here. | **CLI checked for headless server/web/attach.** No equivalent managed cloud product was established. |

## Extension and plugin comparison

| Extension | Codex | Claude Code | OpenCode | Portability judgment |
|---|---|---|---|---|
| Skills | `SKILL.md`; repository skills can live under `.agents/skills`. | `SKILL.md` under Claude skill/plugin locations. | `SKILL.md`; explicitly discovers `.opencode`, `.claude`, and `.agents` skill locations. | The instruction format is similar, but discovery and metadata are not identical. Keep canonical workflow instructions separate and use thin client wrappers. |
| Plugins | Installable bundles can package workflows and integrations around skills, tools/apps, and MCP. | Plugins can bundle skills, agents, hooks, and MCP configuration. | Local JavaScript/TypeScript or npm plugins add hooks, tools, and integrations. | Plugin packages are **not** directly portable. The runtime and manifest differ in every product. |
| Hooks | Lifecycle hooks are documented and configurable. | Broad documented hook system, including command, HTTP, MCP, prompt, and agent hooks. | Plugin events can intercept tool and session behavior. | Keep required enforcement in repository scripts/CI. Treat product hooks as convenience and defense in depth. |
| MCP | Supports STDIO and Streamable HTTP servers, including OAuth. | Supports local and remote MCP configuration and plugin-bundled servers. | Supports local and remote MCP servers; MCP tools add context and need deliberate permission control. | This is the best common integration boundary across all three products. |
| Custom agents | Configurable agent roles and model/reasoning overrides. | Custom subagents can have their own prompts, tools, models, skills, and permissions. | Custom primary/subagents can have model, prompt, tool, and permission settings. | Exchange task contracts and result files, not private internal agent state. |
| External providers | Supports configured model providers and Ollama/local OSS modes, but the normal product is optimized around OpenAI models. | Supports Anthropic access plus supported cloud/provider routes; shared Ollama tests required a wrapper. | Provider catalog and custom provider configuration are central features. | OpenCode is the preferred model-routing worker; do not force it to be the safety/integration lead. |

## What the benchmark has actually shown

### Shared model: harness contribution

On T4 with the same Kimi K2.7 route, all three assistants produced interfaces
that passed functional and browser behavior after correcting a contaminated
grader assumption. OpenCode finished in 52.582 seconds, Claude in 54.480, and
Codex in 87.538. This is the cleanest evidence that OpenCode itself is worth
testing, not only its model catalog.

### Best accessible product: model plus harness

On corrected T4, Codex/GPT-5.6 Sol, Claude Code/Opus 5, and OpenCode/Kimi K3 all
scored 100. Kimi/OpenCode was fastest at 221.644 seconds, Codex took 350.694,
and Claude took 483.388. Qwen3.8-27B/OpenCode timed out at 20 minutes with a
working but incomplete result. One task does not establish a general speed or
quality winner.

### All-assistant workflow

T5 proved that a frontier lead can plan, another frontier system can challenge
the plan, and an open model can implement the bounded work. Kimi's accepted
patch needed zero Codex integration edits. The distributed workflow nevertheless
took 536.704 seconds versus 150.206 seconds for solo Codex, with both scoring
100 after the grader correction. Distribution bought role separation and an
audit trail, not higher quality or lower latency.

## How the three tools should work together

Use a portable core with thin tool-specific adapters:

1. `AGENTS.md` remains the shared repository contract. `CLAUDE.md` imports it;
   OpenCode and Codex read it directly.
2. Frozen prompts, JSON task contracts, graders, and verification commands stay
   in ordinary repository files. No assistant owns the source of truth.
3. Each active writer gets an isolated worktree and exclusive file ownership.
4. Handoffs are saved as Markdown plans, JSON results, or patch files. Do not
   depend on one product reading another product's private session database.
5. Put shared external tools behind a small read-only MCP server. Configure the
   same server separately in each client.
6. Keep required policy checks in scripts and CI. Add Codex, Claude, or OpenCode
   hooks only as faster local feedback.
7. Use Codex as lead/integrator, Claude as independent plan/final reviewer, and
   OpenCode with the selected hosted open model for tightly bounded worker
   tasks. Reverse the frontier roles only when a new run can change the
   conclusion.

## No-cost feature pilot checklist

The next feature block should use a fixture repository and no paid inference
unless separately approved.

| Pilot | Setup | Pass condition | Record |
|---|---|---|---|
| Instruction loading | One shared `AGENTS.md`, a minimal `CLAUDE.md` shim, and one nested override. | Each assistant identifies the effective rule and obeys the nested override. | Files read, wrong-rule count, added prompt tokens where exposed. |
| Permission conformance | Allow one file and one exact test command; deliberately request a second write, unrelated Git discovery, and network. | Allowed operations work; all three forbidden operations are denied without side effects. | Prompts, denials, filesystem diff, OS-level versus policy-level enforcement. |
| Resume/recovery | Stop after a saved checkpoint, then resume or fork. | The assistant continues without redoing the edit or forgetting acceptance checks. | Resume commands, elapsed time, duplicate tool calls, final scope. |
| Shared skill | A small `benchmark-audit` workflow with one canonical instruction source and thin wrappers. | Each product invokes it on demand and returns the same required fields. | Install files, context overhead, invocation reliability, disable/uninstall path. |
| Shared MCP | One local read-only server with `get_task_contract` and `summarize_run` tools. | All three discover and call it; denied mutation is impossible by server design. | Setup steps, calls, errors, extra context/tokens, permission prompts. |
| Native delegation | One lead plus two read-only repository reviewers; no parallel writes. | Findings are combined with source paths and no workspace changes. | Wall time, total tokens, duplicated reads, disagreement, inspection experience. |
| Browser | One local UI flow and one console-error case. | The same observable behaviors are checked at desktop and mobile width. | Native versus MCP/external route, setup time, screenshots, console evidence. |
| Telemetry export | One tiny fixed task. | Model, elapsed time, tool calls, errors, and token fields are recoverable; cost is labeled as metered, estimate, subscription telemetry, or missing. | Raw JSON plus a normalized result record. |

Do not combine these feature pilots into the existing T1-T5 quality scores.
They answer whether the harness can be operated safely and repeatably.

## Adoption decision now

| Product | Current role | Reason |
|---|---|---|
| Codex | **Primary lead and default implementation tool** | Best fit for controlled local work, integration, app/browser workflow, and safe autonomy; top-native result was fully accepted. |
| Claude Code | **Primary independent reviewer and alternate lead** | High-value plan challenge and review quality; excellent documented extension surface; automation modes need explicit validation. |
| OpenCode | **Strong secondary tool and open-model worker** | Real accepted results, fastest successful T4 route, flexible providers, and the best metered cost visibility; reliability varies materially by model and browser automation is not yet comparable. |

## Official references

Codex:

- [Best practices and customization](https://learn.chatgpt.com/guides/best-practices)
- [Permissions](https://learn.chatgpt.com/docs/permissions)
- [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Plugins](https://learn.chatgpt.com/docs/plugins)
- [Built-in browser](https://learn.chatgpt.com/docs/browser?surface=app)
- [Git worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)

Claude Code:

- [Extension overview](https://code.claude.com/docs/en/features-overview)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Hooks](https://code.claude.com/docs/en/hooks)
- [Subagents](https://code.claude.com/docs/en/subagents)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Chrome integration](https://code.claude.com/docs/en/chrome)

OpenCode:

- [Agents](https://opencode.ai/docs/agents/)
- [Permissions](https://opencode.ai/docs/permissions/)
- [Providers](https://opencode.ai/docs/providers/)
- [Skills](https://opencode.ai/docs/skills/)
- [Plugins](https://dev.opencode.ai/docs/plugins/)
- [MCP servers](https://dev.opencode.ai/docs/mcp-servers/)
- [CLI](https://opencode.ai/docs/cli/)

OpenCode's separate V2 documentation currently labels its plugin API beta and
uses different configuration shapes. This report evaluates installed OpenCode
`1.18.21` and the configuration that actually ran. Treat V2 portability as a
future migration question, not a current benchmark feature.
