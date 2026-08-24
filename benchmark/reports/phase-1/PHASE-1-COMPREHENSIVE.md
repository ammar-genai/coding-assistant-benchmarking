# Phase 1 comprehensive report: coding assistants, models, and distributed delivery

Evidence window: 2026-08-22 through 2026-08-24  
Status: Phase 1 complete; Phase 2 neutral Pi comparison pending  
Primary assistants: Codex, Claude Code, OpenCode  
Neutral pilot runner: Pi

## 1. Purpose and final answer

This study was designed to answer practical questions rather than declare one
universal winner:

1. How does Codex differ from Claude Code?
2. Is OpenCode worth using?
3. How do the best accessible OpenAI and Anthropic models compare with leading
   hosted open-weight models?
4. Can a frontier model plan and review while a cheaper model implements?
5. Does distributing one project across all three assistants improve the
   result?
6. What can be shared across their harnesses, skills, plugins, and MCP tools?

The Phase 1 answer is:

- **Use Codex as the default lead and integrator.** It was consistently strong
  at controlled implementation, repository ownership, and final verification.
- **Use Claude Code as the independent reviewer and alternate lead.** Opus was
  especially valuable when challenging plans and finding workflow defects that
  green local tests had missed.
- **Keep OpenCode as a strong secondary tool and model router.** It was the
  easiest environment in this study for switching hosted open models, recording
  provider cost, and preserving both successes and failures.
- **Use top open models selectively.** Kimi and Qwen produced accepted work on
  bounded tasks, but the same model family could be slow or fail to write on a
  broader task. “Open model” is not a sufficient routing rule.
- **Distribute work when independent review, ownership, or auditability is worth
  the overhead.** The controlled distributed task tied the solo result but took
  3.57 times as long. The larger product showed more clearly why independent
  review can still justify the extra steps.

These are role recommendations from a pilot with mostly one run per route. They
are not reliability estimates and do not prove that any model will win on every
repository.

## 2. What was in scope

### Coding assistants and harnesses

| Product | Role tested | Main strength observed | Main limit observed |
|---|---|---|---|
| Codex | Primary assistant, frontier implementer, integrator | Controlled completion, small tool traces, repository integration | Subscription inference did not expose comparable dollar cost; one shared-model adapter was noisy |
| Claude Code | Primary assistant, frontier implementer, plan challenger, reviewer | Deep tests, detailed evidence, useful independent review | More permission negotiation and longer traces in several runs |
| OpenCode | Primary assistant candidate and hosted-model router | Easy model switching, strict permissions, structured telemetry, direct provider cost | Outcome varied materially with model and task size; no comparable native browser block |
| Pi | Neutral early pilot runner | Useful shared-model comparison surface | Not evaluated deeply enough to rank as a primary assistant in Phase 1 |

In this report, “harness” simply means the assistant environment that connects
the model to repository files, tools, permissions, sessions, and output
telemetry. The model and harness were treated as separate factors whenever the
design allowed it.

### Models accessed or tested

- OpenAI: GPT-5.6 Sol, GPT-5.6 Terra, and an earlier Codex subscription default
  whose exact served model was not emitted.
- Anthropic: Claude Opus 5 and Sonnet 5. Fable 5 was requested but could not run
  because account usage credits were disabled; the HTTP 429 occurred before
  inference and cost `$0`.
- Hosted open-weight routes: DeepSeek V4 Flash Cloud, Kimi K2.7 Code Cloud,
  Kimi K3 through OpenRouter, and Qwen3.8-27B through OpenRouter.
- Local side control: Qwen 8B. It was not part of the main ranking because a
  16 GB laptop is not a credible host for the large models in scope.

## 3. Method and evidence rules

The study used frozen prompts, task contracts, rubrics, baselines, permission
policies, and timeouts. Runs were saved before interpretation. Each substantive
change was checked with visible tests, private checks where available, scope
validation, and browser testing where the task required it.

The following integrity rules matter when reading the results:

- Raw failures are retained even when an audit proves the grader or harness was
  wrong.
- A corrected score is labeled as a correction to the saved patch, not as a
  rerun or a retroactive raw pass.
- A timeout remains a timeout even if its partial patch later works in the
  browser.
- Subscription CLI cost telemetry is not treated as billed API spend.
- Token totals are retained per adapter but not ranked across products because
  cache reads, resent context, reasoning, and totals are defined differently.
- Most routes have one observation. A one-run result demonstrates capability or
  failure in that run, not a stable success rate.
- Product-specific permission surfaces were preserved. A shared model does not
  imply a perfectly identical tool environment.

Two benchmark defects were discovered and corrected transparently:

1. T4 shared-harness grading required a CSS class named `.outcome`, although the
   task required visible outcome text. The saved patches were contract-correct;
   raw grader failures remain recorded.
2. T5's private checker required the phrase `in-memory`, while the accepted
   implementation used `in memory`. Version 1.0.1 corrected the grader and was
   applied to the unchanged saved patches.

T7 also exposed two worker-evaluation defects: Terra's first isolated worktree
lacked a dependency link and produced an incremental artifact, while Sonnet's
hidden source check required an internal variable named `hasErrors` even though
`hasBookingErrors` behaved correctly. Both raw automatic failures remain
visible; the integrated source is described as behaviorally accepted, not
silently relabeled.

## 4. Study progression

| Stage | Question | Design | Main result |
|---|---|---|---|
| Setup and access | Can the assistants and model routes be used safely? | Authentication, environment capture, frozen contracts, conservative spend limits | Codex and Claude subscriptions worked; OpenRouter and Ollama Cloud enabled large hosted open models without local hosting |
| T1 | How do harnesses behave on read-only repository analysis? | Same DeepSeek model across Codex, Claude Code, OpenCode, and Pi | All passed; quality spread was only three points, while elapsed time and token reporting differed greatly |
| T2 | Can they make a tiny controlled fix? | Same DeepSeek model across three assistants; then DeepSeek, Kimi, and Qwen through OpenCode | All primary assistants produced the same correct patch; all three open models tied at 100 on the small task |
| T3 | Do differences appear on a moderate implementation? | Shared Kimi and DeepSeek routes plus native subscription controls | All routes functionally passed; one Codex/DeepSeek run failed scope because of `tsconfig.tsbuildinfo` |
| T4 | How do shared harnesses and top native routes handle a complex UI? | Shared Kimi K2.7 block plus strongest accessible product/model routes | Shared runs all passed after grader correction; Sol, Opus, and Kimi K3 scored 100; Qwen timed out with a working but incomplete patch |
| T5 | Can frontier planning and review surround an open worker? | Codex plan, Claude review, OpenCode/Kimi implementation, Codex integration, Claude final review; solo Codex control | Both scored 100; distributed route required no repair but was 3.57 times slower |
| T6 | What happens on a subtle concurrency/cache defect? | Sol versus Opus, then Kimi K2.7 through all three harnesses | Both frontier routes were correct; Codex was faster. With shared Kimi, OpenCode was fastest and scored 99 |
| Portable extension | Can one audit workflow operate across products? | Canonical workflow, thin skills, read-only MCP server | Codex and OpenCode passed immediately; Claude required exact MCP tool preauthorization, then passed in a frozen recovery |
| T7 | Can the planned distributed pattern build a realistic mock product? | Frontier architecture/review, mixed frontier/open workers, frontier integration and repair | Product completed. Qwen succeeded narrowly; Kimi timed out broadly; Opus found two real high-severity workflow defects |

## 5. Detailed results

### 5.1 Early shared-model pilots: T1 through T3

T1 held the model constant with DeepSeek V4 Flash Cloud and allowed only
read-only repository analysis. All four harnesses passed without changing the
workspace or requesting intervention.

| Harness | Score | Elapsed | Reported input | Reported output |
|---|---:|---:|---:|---:|
| Codex | 95 | 33.783 s | 259,574 | 4,726 |
| OpenCode | 94 | 24.510 s | 33,861 | 1,328 |
| Pi | 92 | 23.735 s | 19,570 | 1,597 |
| Claude Code | 92 | 75.578 s | 185,451 | 6,160 |

The three-point score spread was too small to justify a quality hierarchy. The
large token differences were useful as adapter diagnostics but not a fair
efficiency ranking. Claude's wrapper reported `$1.100385`; it was an estimate,
not a confirmed charge.

On T2, all three primary assistants used DeepSeek to make the same minimal fix,
passed 2 of 2 visible checks and 5 of 5 private checks, and scored 100. OpenCode
finished in 7.072 seconds, Codex in 7.166 seconds, and Claude Code in 23.648
seconds. Holding OpenCode constant and changing the model also produced a
three-way tie: Qwen3.8-27B finished in 37.815 seconds for a reported
`$0.0090234`, DeepSeek in 7.528 seconds, and Kimi K2.7 in 7.092 seconds. The task
was deliberately too small to establish a model-quality winner.

T3 introduced a multi-file change and assistant-authored tests. OpenCode with
DeepSeek scored 100 in 20.410 seconds; Codex with DeepSeek was functionally
correct but scored 90 because it wrote an unapproved `tsconfig.tsbuildinfo`;
Claude with DeepSeek scored 100 in 58.158 seconds. Kimi K2.7 scored 100 through
OpenCode, Codex, and Claude in 24.824, 35.194, and 55.512 seconds respectively.
Native controls—Codex subscription default and Claude Sonnet 5—also scored 100
in 106.852 and 44.801 seconds. T3's most useful lesson was that functional
correctness and repository discipline must be scored separately.

### 5.2 T4 complex interface

The shared Kimi K2.7 block separated harness behavior from model choice. All
three implementations passed the task contract and browser checks after the
grader defect was identified.

| Harness + Kimi K2.7 | Contract result | Score | Elapsed | Tool calls |
|---|---|---:|---:|---:|
| Codex | Pass; raw grader fail | 98 | 87.538 s | 7 |
| Claude Code | Pass; raw grader fail | 100 | 54.480 s | 14 |
| OpenCode | Pass | 99 | 52.582 s | 13 |

The top-native block then compared the strongest accessible product/model
routes on the same corrected task.

| Product route | Runner result | Score | Elapsed | Evidence summary | Cost label |
|---|---|---:|---:|---|---|
| OpenCode + Kimi K3 | Pass | 100 | 221.644 s | 12 visible, 7 private, browser pass | `$0.5790162` metered |
| Codex + GPT-5.6 Sol | Pass | 100 | 350.694 s | 8 visible, 7 private, browser pass | Subscription; not exposed |
| Claude Code + Opus 5 | Pass | 100 | 483.388 s | 14 visible, 7 private, browser pass | `$2.473437` subscription telemetry |
| OpenCode + Qwen3.8-27B | Timeout; post-timeout patch graded | 87 | 1,200.289 s | Browser-correct partial UI, 6 of 7 private, no student tests or final report | `$0.1518036` metered |

Kimi was the fastest accepted route. Codex reached the same score with only 11
tool calls, compared with 20 for Kimi and 44 for Opus. Claude produced the
largest test set and strongest final evidence. Qwen did not make its first edit
until 1,047.243 seconds and hit the fixed 20-minute timeout. Its interface
worked, but workflow completion is part of coding-assistant quality, so it
cannot be counted as an accepted run.

### 5.3 T5 controlled distributed workflow

T5 tested the proposed high-level architecture directly:

1. Codex/Sol planned the work in 86.071 seconds.
2. Claude/Opus challenged the plan in 93.772 seconds and identified seven
   blocking gaps or decisions.
3. OpenCode/Kimi K3 implemented exactly five owned files in 112.515 seconds,
   passing 9 of 9 visible checks and 7 of 7 corrected private checks.
4. Codex integrated and verified in 82.567 seconds without editing Kimi's
   patch.
5. Claude performed a 160.346-second final review and found no high or medium
   defects.

The distributed route scored 100 in 536.704 seconds and incurred `$0.6175818`
of metered OpenRouter cost. Solo Codex/Sol scored the same 100 in 150.206
seconds. The distributed route was 386.498 seconds slower, or 3.5731 times the
solo time.

The experiment proved that frontier planning and review can surround a cheaper
implementation worker without repair. It did not show a speed or score benefit.
Its value was separation of duties, a challenged plan, explicit file ownership,
and an independent audit trail.

The first T5 attempt is also preserved. Claude's read-only adapter entered a
plan-mode interaction that tried to write a plan file and timed out before the
worker stage. T5 v2 changed the adapter and succeeded; the original failure was
not deleted or described as a model failure.

### 5.4 T6 frontier and shared-harness incident work

T6 was a subtle rejected-Promise cache defect with concurrency and replacement
races. It was the clearest direct frontier comparison.

| Route | Score | Elapsed | Visible | Private | Tool calls / denials |
|---|---:|---:|---:|---:|---|
| Codex + GPT-5.6 Sol | 99 | 129.209 s | 8/8 | 8/8 | 7 / 0 |
| Claude Code + Opus 5 | 97 | 228.453 s | 11/11 | 8/8 | 29 / 10 |

Both fixes were correct. Codex was 99.244 seconds faster and used a smaller
trace. Claude wrote broader tests and a more detailed incident note, but spent
more time negotiating the deliberately narrow Bash policy.

With Kimi K2.7 held constant, every harness passed all eight private checks:

| Harness + Kimi K2.7 | Score | Elapsed | First edit | Denials | Trace note |
|---|---:|---:|---:|---:|---|
| OpenCode | 99 | 55.115 s | 11.660 s | 1 | Cleanest and fastest run |
| Claude Code | 98 | 78.832 s | 30.884 s | 2 | Detailed trace |
| Codex | 98 | 93.662 s | Not used for ranking | 0 | 2,353,680 stderr bytes from repeated warnings |

This was OpenCode's strongest evidence as a harness: same model, same task,
accepted result, fastest time. It remains one run under different product
permission surfaces, not a general performance guarantee.

### 5.5 Portable audit extension

The study also tested whether useful infrastructure could be shared without
locking the repository to one assistant. The extension contains:

- one canonical audit workflow;
- thin assistant-specific skill wrappers; and
- one dependency-free, read-only MCP server exposing `get_task_contract` and
  `summarize_run`.

No-model checks passed, including 4 of 4 MCP tests and configuration parsing.
OpenCode/Kimi passed the invocation pilot in 6.938 seconds and Codex/Sol passed
in 20.762 seconds. Claude/Opus failed the first counted invocation in 22.921
seconds because its exact MCP calls were denied under `dontAsk`. It correctly
reported insufficient evidence instead of using a shell fallback. A separately
frozen recovery preauthorized only the two required tools, after which Claude
passed.

The result is ready as an opt-in extension, not a default benchmark feature.
Changing the default tool surface would change what future benchmark runs are
measuring.

### 5.6 T7 distributed trade-capture product

T7 applied the operating model to a larger synthetic securitized-products trade
capture workflow. It is a mock application, not production booking, pricing,
settlement, regulatory, or risk software.

| Stage | Assistant + model | Outcome | Elapsed | Cost label |
|---|---|---|---:|---|
| Architecture | Codex + Sol | Manual pass, read-only | 203.673 s | Subscription; no dollars exposed |
| Plan challenge | Claude + Opus | Approve with required changes | 319.008 s | `$1.2314075` subscription telemetry |
| Domain worker | Codex + Terra | Raw automatic fail; behavioral source accepted | 161.146 s | Subscription; no dollars exposed |
| Ticket worker | Claude + Sonnet | Raw automatic fail; behavioral source accepted | 1,085.797 s | `$0.5752952` subscription telemetry |
| Insights worker | OpenCode + Qwen | Pass | 181.703 s | `$0.1071646` metered |
| Workspace worker | OpenCode + Kimi K3 | 30-minute timeout; zero changed files | 1,800.260 s | `$0.2648436` metered |
| Integration and Kimi fallback | Codex frontier host | Six missing workspace files implemented and workers integrated | Not instrumented | Subscription |
| Independent review | Claude + Opus | Accept with findings | 336.766 s | `$1.9140135` subscription telemetry |

The isolated stages total 4,088.353 seconds, about 68 minutes, excluding host
integration and repair. Qwen's tightly bounded component passed all checks and
integrated unchanged for about eleven cents. Kimi read 24 files and formed a
plan, but never wrote before the 30-minute limit; Codex owns the six fallback
files and that attribution is preserved.

Opus's final review found two real high-severity defects after local checks were
green: a booked trade could regress to draft, and Validate cleared the ticket
before the natural Book step. Codex repaired those findings and several lower
severity issues without rerunning or rewriting the independent review. Final
verification passed typecheck, lint, build, 12 product tests, 4 MCP tests, 4
frozen workspace checks, benchmark validation, and diff checks.

The application is available locally at `/trade-capture`. The user later viewed
the app, but formal T7 browser QA remains **unverified** in the saved benchmark
because no counted responsive, console, keyboard, and flow checklist was
completed after the in-app browser failed to bind a valid tab. Personal visual
inspection should not be relabeled as a formal benchmark pass.

## 6. Assistant conclusions

### Codex

Codex differentiated itself through controlled execution and repository
ownership. It used the fewest successful-route tool calls on T4, produced the
faster and higher-scoring frontier T6 result, handled integration cleanly in T5,
and recovered the larger T7 project when an open worker failed. It is the best
default lead in this evidence set.

Its limitations are measurable: subscription inference did not provide a
comparable dollar cost, one shared Ollama adapter produced excessive stderr,
and native strength does not imply that every third-party model route through
the Codex harness will be equally efficient.

### Claude Code

Claude Code differentiated itself through depth of review, test breadth, and
explicit evidence. It identified seven plan gaps in T5 and two genuine
high-severity product defects in T7. Opus's native implementation runs were
correct, but generally slower and more tool-heavy than Codex in the direct
frontier comparisons.

Claude's granular permissions are a strength for interactive safety but can add
friction to automation. MCP discovery did not guarantee invocation permission,
and narrow Bash policies created repeated denials. Exact preauthorization works
better than broad permission expansion.

### OpenCode

OpenCode is worth continued use. It delivered the fastest successful top-native
T4 route with Kimi K3, the fastest shared-Kimi T6 run, exact provider cost for
OpenRouter, and strict permission enforcement. It also preserved Qwen and Kimi
timeouts clearly instead of hiding partial or zero-write outcomes.

It should remain secondary until there are repeated reliability samples and
more native-feature evidence. Its quality depends heavily on the routed model
and assignment size. A good harness cannot make every model-task pairing
successful.

## 7. Model conclusions

| Model or family | Best observed use | Evidence-based caution |
|---|---|---|
| GPT-5.6 Sol | Architecture, complex implementation, integration | Subscription dollar cost not exposed; most results are single runs |
| Claude Opus 5 | Plan challenge, independent review, deep implementation evidence | Slower and more tool-heavy in direct frontier runs; CLI dollars are telemetry |
| GPT-5.6 Terra | Bounded domain implementation under frontier supervision | T7 source later needed lifecycle/date repairs after independent review |
| Claude Sonnet 5 | Mid-level bounded UI worker | T7 elapsed was long and its raw grader failed on an invalid source-name check |
| Kimi K3 | Complex bounded UI and five-file implementation | Timed out for 30 minutes with zero writes on a broad T7 workspace assignment |
| Kimi K2.7 Code | Shared-model harness testing and bounded incident work | Ollama-reported `$0` is not proof of zero underlying cloud cost |
| Qwen3.8-27B | Small or tightly bounded components | Complex T4 ownership timed out; broad reading can consume time and tokens |
| DeepSeek V4 Flash | Fast early shared-model controls | Only early tasks were covered; no top-complexity ownership result |

The practical routing rule is to match task size and ambiguity, not ideology:

- use Sol or Opus for ambiguous architecture and high-risk review;
- use Terra or Sonnet for well-bounded mid-level work;
- use Kimi, Qwen, or DeepSeek for small, explicit, non-overlapping assignments;
- set a first-edit checkpoint and a hard timeout; and
- retain a frontier fallback and an independent final verification step.

## 8. Cost, token, and time interpretation

### Counted main-block ledger

The saved Phase 1 conclusion records `$1.7484880` of cumulative measured
OpenRouter spend through T7:

| Counted ledger segment | Metered amount |
|---|---:|
| T4 access checks and counted Kimi/Qwen runs | `$0.7588980` |
| T5 Kimi implementation worker | `$0.6175818` |
| T7 Qwen and Kimi workers | `$0.3720082` |
| **Counted main-block total** | **`$1.7484880`** |

T7 had a separately approved `$4.00` ceiling and used `$0.3720082`, leaving
`$3.6279918` of approved headroom. No provider limit was increased.

### Reconciliation note for early Qwen activity

Three earlier reports also contain OpenRouter-reported charges: `$0.0011946`
for the Qwen connectivity check, `$0.1632682` for the T1 Qwen pilot, and
`$0.0090234` for Qwen's T2 worker run. They total `$0.1734862` but are not
included in the later `$1.7484880` cumulative field. Therefore:

- use **`$1.7484880`** when quoting the preregistered/counting ledger used by
  the final study report; and
- use **`$1.9219742`** as the sum of every OpenRouter-reported line item visible
  in Phase 1 reports, including setup and early pilots.

This is a reporting-scope reconciliation, not evidence of an unauthorized
charge. Before publishing an external cost total, the provider dashboard should
be reconciled against the run timestamps. No new paid request is needed to do
that.

Anthropic dollar fields are explicitly subscription CLI telemetry, not billed
project spend. Codex subscription runs exposed no comparable dollar amount.
Ollama wrapper zeroes are also not proof that the hosted service had zero
underlying cost.

Tokens should not be totaled across assistants. Some adapters include cache
reads or reasoning, some count resent context, and some expose overlapping
subsets. For cross-product decisions, Phase 1 gives the most weight to accepted
outcome, elapsed time, directly observed metered provider charge, tool/permission
friction, scope discipline, tests, and human intervention.

## 9. How the tools can work together

The portable layer should be ordinary repository evidence, not private session
memory:

1. Put shared instructions in `AGENTS.md`; use a thin `CLAUDE.md` import shim
   only where Claude needs its native filename.
2. Freeze prompts and acceptance criteria in Markdown and JSON before execution.
3. Give every writer an isolated worktree and non-overlapping file ownership.
4. Hand off plans, patches, result JSON, and reports—not undocumented chat
   summaries.
5. Keep mandatory checks in repository scripts and CI rather than one product's
   private hooks.
6. Put portable read-only operations behind MCP when useful, with exact tool
   permissions for each assistant.
7. Package product-specific skills or plugins only as thin convenience layers
   around the portable source workflow.

The recommended delivery sequence is:

`Codex/Sol plan → Claude/Opus challenge → bounded worker tasks through Codex,
Claude, or OpenCode → Codex integration → Claude/Opus risk review → Codex repair
and final gate`.

For normal small work, collapse that sequence to one Codex session. Add the
other roles only when task risk or learning value justifies the extra time.

## 10. Limitations and claims that should not be made

- Do not call the study a statistically significant benchmark; most routes ran
  once.
- Do not rank token efficiency across adapters.
- Do not compare Claude subscription telemetry with metered OpenRouter charges
  as if both were invoices.
- Do not say Fable 5 was tested; access failed before inference.
- Do not say Qwen's T4 run passed; it timed out, despite a working partial UI.
- Do not say Kimi implemented the T7 workspace; it wrote zero files.
- Do not say the distributed T5 route was faster or higher quality than solo
  Codex; it tied on score and was 3.57 times slower.
- Do not say T7 passed formal browser QA; that evidence remains open.
- Do not infer free cloud inference from Ollama wrapper `$0` telemetry.
- Do not treat the mock trade-capture application as production financial
  software.

## 11. Phase 1 deliverables and evidence map

The main evidence is preserved in:

- [Final study report](../final-study-report.md)
- [Harness feature matrix](../harness-feature-matrix.md)
- [T4 top-native comparison](../T4-top-native-comparison.md)
- [T5 distributed comparison](../T5-distributed-workflow-comparison.md)
- [T6 frontier comparison](../T6-top-frontier-comparison.md)
- [T6 shared-Kimi comparison](../T6-shared-kimi-harness-comparison.md)
- [Portable extension pilot](../portable-extension-pilot.md)
- [Audit invocation pilot](../benchmark-audit-invocation-pilot.md)
- [T7 product report](../T7-distributed-trade-capture.md)
- [T7 product contract](../../projects/T7-securitized-trade-capture/CONTRACT.md)
- [T7 architecture](../../projects/T7-securitized-trade-capture/ARCHITECTURE-SOL.md)
- [T7 implementation log](../../projects/T7-securitized-trade-capture/IMPLEMENTATION-LOG.md)

Raw prompts, rubrics, block manifests, and structured result JSON remain under
`benchmark/tasks`, `benchmark/blocks`, and `benchmark/runs`. Private grader
contents are intentionally not reproduced here.

## 12. Phase 2 handoff: neutral Pi model comparison

Phase 2 should answer a narrower question: when the harness is held constant in
Pi, how do the strongest accessible models compare as models rather than as
products?

No Phase 2 paid calls have been made. Before execution, freeze a separate plan
covering model availability, current prices, a spend ceiling, run count,
randomized order, timeout policy, and identical tool permissions. Use a small
but meaningful set rather than every available route:

- one top OpenAI frontier model;
- one top Anthropic frontier model;
- Kimi K3;
- Qwen3.8-27B;
- one of DeepSeek V4 or the strongest accessible GLM route; and
- optionally one mid-level frontier model to test the plan/worker cost tradeoff.

Run at least three task types: repository analysis, a bounded implementation,
and a difficult debugging or integration task. Prefer repeated runs for fewer
models over one run across a large model list. Record pass/fail, corrected and
raw grading, wall time, time to first edit, tool calls, permission failures,
scope, visible/private tests, intervention, model-reported tokens, and directly
metered provider cost.

Phase 1 should remain frozen while that work is performed. Phase 2 results can
then be compared with Phase 1 without rewriting the product-assistant evidence.
