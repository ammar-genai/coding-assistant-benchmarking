# Coding assistant benchmark: pilot findings through T6

Date: 2026-08-23

Status: pilot conclusion; selective repeats remain optional

## Executive answer

| Question | Current answer |
|---|---|
| Codex versus Claude Code | Use Codex as the default lead and integrator. Use Claude Code as the independent reviewer and alternate lead. Both produced excellent frontier-model work; Codex had the cleaner and faster T6 execution, while Claude repeatedly added useful review depth. |
| Is OpenCode worth exploring? | **Yes: strong secondary tool.** It is the best model-routing harness in this study, delivered accepted complex work, and was fastest when Kimi K2.7 was held constant across all three assistants. |
| Frontier versus open models | The best open routes were competitive on individual tasks. Kimi K3 matched both frontier products at 100 on T4, and Kimi K2.7 solved T6 through every harness. Qwen3.8-27B timed out on T4, so open-model quality is not interchangeable. |
| Cost, tokens, and time | Metered OpenRouter spend was `$1.3764798`. Subscription cost was not exposed consistently. Token fields differed too much between clients for a fair single efficiency ranking. Time and accepted outcome are the dependable cross-product measures here. |
| Frontier planning plus cheaper implementation | It worked: Kimi implemented T5 with no frontier repair and passed every corrected private check. It was not faster on this task; the distributed route took 3.57 times the solo Codex time. |
| Did the three-assistant workflow win? | It tied solo Codex at 100, but took 536.704 seconds versus 150.206 seconds. Its benefit was independent plan challenge, ownership, and an audit trail—not speed or a higher score. |

These are evidence-backed role recommendations, not a claim that one product or
model wins every repository and task.

## 1. Codex versus Claude Code

### Recommendation

**Codex is the primary lead and default implementation tool. Claude Code is the
primary independent reviewer and alternate lead.**

The clearest frontier comparison was T6, a rejected-Promise cache incident with
concurrency and replacement-race requirements:

| Route | Score | Time | Visible | Private | Permission denials |
|---|---:|---:|---:|---:|---:|
| Codex + GPT-5.6 Sol | 99 | 129.209 s | 8/8 | 8/8 | 0 |
| Claude Code + Opus 5 | 97 | 228.453 s | 11/11 | 8/8 | 10 |

Both fixes were correct and safe. Codex reached the accepted result with a
smaller execution trace. Claude wrote broader tests and a more detailed
incident note, but lost time negotiating the deliberately narrow Bash policy.

Their T4 top-native interface results were both 100. Codex used 11 tool calls
and finished in 350.694 seconds. Claude used 44 tool calls and finished in
483.388 seconds, while producing the largest test suite and strongest final
evidence. This pattern supports different roles rather than a simple quality
winner: Codex for controlled completion and integration; Claude for adversarial
review and evidence depth.

### Practical differentiators

| Area | Codex | Claude Code |
|---|---|---|
| Local safety | Strong workspace/read-only sandbox behavior and effective isolated-worktree use in this study. | Strong tool allowlists and explicit denials; narrow automation requires careful command preauthorization. |
| Planning and integration | Best fit here for repository control, integration checks, and concise completion. | Best observed plan challenger; identified seven useful gaps before T5 implementation. |
| Tool trace | Usually smaller in the frontier runs. The shared Ollama adapter was noisy and shell-heavy. | Rich Read/Edit/Write/Bash trace and detailed telemetry, with more permission negotiation. |
| Browser workflow | Strong documented app/browser path; the shared external browser was used for counted QA. | Browser and preview support exists, but was not isolated in a counted native-feature block. |
| Extensions | Skills, plugins, MCP, hooks, and custom agents. | Mature skills, plugins, MCP, hooks, subagents, and teams. |
| Cost visibility | Subscription inference did not expose a dollar amount. | CLI exposed equivalent-cost telemetry, but it was not billed study spend and must not be compared with OpenRouter charges. |

Claude Fable 5 was the requested top Anthropic route but required usage credits
that were not enabled. Opus 5 is therefore the best accessible Claude result,
not a silent model substitution.

## 2. OpenCode adoption decision

**Verdict: strong secondary tool and open-model worker.**

OpenCode earned this verdict in three different ways:

1. On top-native T4, OpenCode + Kimi K3 scored 100 in 221.644 seconds, the
   fastest of the three successful top-product routes.
2. In distributed T5, Kimi implemented all five owned files, passed 9 of 9
   visible and 7 of 7 corrected private checks, and needed zero Codex repair.
3. On shared-model T6, OpenCode was the fastest harness with the exact same Kimi
   K2.7 model: 99 points in 55.115 seconds versus 78.832 for Claude Code and
   93.662 for Codex. All three passed all eight private checks.

OpenCode's main advantage is not a claim that its interface is always smarter.
It is the easiest place in this study to switch among Ollama Cloud and
OpenRouter routes while retaining usable permissions, structured transcripts,
cache/token fields, and provider cost telemetry.

It is not the primary tool yet because model reliability varied sharply,
native browser automation was not comparable, and the study has one run per
route rather than a reliability sample. Qwen3.8-27B's 20-minute T4 timeout is
the clearest warning: a good harness cannot compensate for every model-task
pairing.

## 3. Top proprietary and open-model quality

### Corrected T4 top-native result

| Product route | Score | Time | Result | Cost label |
|---|---:|---:|---|---|
| OpenCode + Kimi K3 | 100 | 221.644 s | Pass | `$0.5790162` metered |
| Codex + GPT-5.6 Sol | 100 | 350.694 s | Pass | Subscription; not exposed |
| Claude Code + Opus 5 | 100 | 483.388 s | Pass | Subscription telemetry only |
| OpenCode + Qwen3.8-27B | 87 | 1,200.289 s | Timeout with partial patch | `$0.1518036` metered |

Kimi K3 was genuinely competitive on this task. The result should not be
stretched into a general claim that Kimi is better than Sol or Opus: it is one
interface task, and the three products did not share the same model.

### Shared open-model evidence

- DeepSeek V4 Flash passed T1 through all four early harnesses and passed T2
  functionally through all three primary assistants.
- Kimi K2.7 passed the T3 implementation through Codex, Claude Code, and
  OpenCode. It also passed the more difficult T6 incident through all three.
- Kimi K3 delivered the complete T4 interface and the T5 cross-layer feature
  through OpenCode.
- Qwen3.8-27B passed the small T2 worker task for `$0.0090234`, but was too slow
  and incomplete on T4.
- The local Qwen 8B model remains only a small side control on this 16 GB
  laptop; large local models were correctly excluded from the core study.

The useful conclusion is selective routing: use a top open model for bounded,
well-specified work, and keep a frontier model for ambiguous planning,
integration, or high-risk review.

## 4. Cost, tokens, and time

### Metered spend

- Cumulative OpenRouter spend: `$1.3764798`.
- Approved ceiling: `$1.50`.
- Remaining allowance: `$0.1235202`.
- Provider limits changed: no.
- Anthropic usage credits enabled: no.

No paid call was made for the frontier T6 block, shared-Kimi T6 block, portable
extension pilot, or browser dashboard work.

### Why token totals are not ranked directly

The clients count cache reads, resent context, reasoning, and totals
differently. In the shared-Kimi T6 block, for example, OpenCode summed 234,166
tokens across step records, Codex reported 315,289, and Claude reported 230,048.
Those numbers are useful for diagnosing each adapter, but they are not a clean
price comparison. The same caution applies to Claude's Ollama wrapper cost
estimate and OpenCode's reported zero: neither proves the user's underlying
Ollama Cloud bill.

For this pilot, compare:

1. accepted versus failed outcome;
2. elapsed time;
3. metered provider charge where directly observed;
4. tool calls and permission failures; and
5. scope, tests, and human intervention.

Keep subscription access and estimated equivalent cost in separate columns.

## 5. Frontier planning with a cheaper worker

T5 proved that the architecture works:

1. Codex wrote the plan and acceptance checks in 86.071 seconds.
2. Claude Code reviewed the plan in 93.772 seconds and found seven gaps or
   decisions worth pinning down.
3. OpenCode + Kimi K3 implemented the five-file feature in 112.515 seconds.
4. Codex integrated and verified without changing the worker patch.
5. Claude performed the final independent review and found no blocking defect.
6. The corrected private grader passed all 7 checks.

This means a frontier model can concentrate on architecture and review while a
hosted open model performs the bounded implementation. It does not mean the
distributed path is automatically cheaper. The worker incurred `$0.6175818`
of metered OpenRouter cost, while frontier subscription inference did not expose
a comparable bill.

Use this pattern when separation of duties, independent review, or an audit
trail matters. For a routine bounded feature, one strong frontier session was
simpler and faster.

## 6. All three assistants in one workflow

The all-assistant T5 route and solo Codex control both scored 100 after a private
grader wording defect was corrected without rerunning or editing either patch.

| Route | Score | Time | Metered API cost | Frontier repair |
|---|---:|---:|---:|---:|
| Codex plan → Claude plan review → OpenCode/Kimi work → Codex integration → Claude final review | 100 | 536.704 s | `$0.6175818` | 0 edits |
| Codex/GPT-5.6 Sol solo | 100 | 150.206 s | Not exposed; subscription | Not applicable |

The distributed route was 3.57 times slower. It did not beat solo Codex on
score, latency, or simplicity. It did produce a better responsibility trail:
the plan was challenged before code, files had one owner, integration was
separate from implementation, and final review came from another vendor.

The right conclusion is conditional, not promotional: distribute high-risk or
review-heavy work; keep ordinary bounded work with one capable assistant.

## Plugins, skills, MCP, and working together

The products should share ordinary repository contracts rather than private
session state:

- `AGENTS.md` is the common instruction source. `CLAUDE.md` is a thin import
  shim where Claude needs its native filename.
- Frozen Markdown prompts and JSON task contracts define work independently of
  the assistant.
- Each writer uses an isolated worktree with non-overlapping file ownership.
- Plans, patches, result JSON, and reports are the handoff format.
- Required checks remain in scripts and CI rather than depending only on one
  product's hooks.

The portable `benchmark-audit` extension demonstrated the common boundary. One
canonical workflow, thin skill wrappers, and one read-only MCP server worked in
Codex, Claude Code, and OpenCode. Codex and OpenCode passed immediately. Claude
first revealed that tool discovery is not the same as authorization; after the
two exact MCP names were preauthorized in a separately frozen recovery, it
passed without broadening permissions.

Plugins themselves are product-specific. Use them to package convenience, but
keep the source workflow and MCP protocol portable.

Pi remains useful as a neutral model lab and independent verifier. It is not a
fourth product in the adoption ranking.

## Recommended operating setup

1. **Default:** Codex + GPT-5.6 Sol owns planning, implementation, integration,
   and browser verification.
2. **High-risk review:** Claude Code + Opus 5 challenges the plan or reviews the
   final patch from a fresh context.
3. **Bounded open-model work:** OpenCode routes the task to the selected Kimi
   model with strict paths and exact checks.
4. **Neutral model checks:** Pi runs small read-only or evaluation prompts when
   assistant features would confound the model comparison.
5. **Handoff:** exchange a small task contract, patch, and evidence record—not a
   large pasted conversation.

Do not run every model in every assistant. First hold the model fixed when
studying the harness, then use each product's best normal model when choosing a
daily tool.

## Limits and next decisions

- Most routes have one counted run. The report describes observed behavior, not
  long-term reliability.
- T4 and T5 exposed grader defects. Raw results remain preserved, and corrected
  interpretations were applied without editing or rerunning assistant patches.
- Fable 5 was not accessible under the approved account settings.
- Native browser, resume, and delegation features were researched but not all
  isolated in counted comparison blocks.
- Local large-model performance was not tested because the laptop has 16 GB of
  memory.
- OpenCode's managed cloud and browser experience is not equivalent to the
  frontier products' first-party surfaces.

Do not spend the remaining OpenRouter allowance on a separate Kimi K3 T6 row.
The completed shared-Kimi block answers the more important harness question
without new metered spend. Run a repeat only when it can change a concrete
adoption decision, and preregister it before execution.

## Evidence map

- Harness features: `benchmark/reports/harness-feature-matrix.md`
- T4 shared harness: `benchmark/reports/T4-shared-harness-comparison.md`
- T4 top native: `benchmark/reports/T4-top-native-comparison.md`
- T5 distributed versus solo: `benchmark/reports/T5-distributed-workflow-comparison.md`
- T6 frontier: `benchmark/reports/T6-top-frontier-comparison.md`
- T6 shared Kimi: `benchmark/reports/T6-shared-kimi-harness-comparison.md`
- Portable extension: `benchmark/reports/portable-extension-pilot.md`
- Extension invocation and recovery: `benchmark/reports/benchmark-audit-invocation-pilot.md` and `benchmark/reports/benchmark-audit-claude-recovery.md`
- Local HTML dashboard QA: `benchmark/reports/results-site-browser-qa.md`
