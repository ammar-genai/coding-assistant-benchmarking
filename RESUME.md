# Project handoff and resume point

Last updated: 2026-08-23

Repository: `coding-assistant-benchmarking`

Branch: `master`

Starting baseline before the Qwen setup: `92b600f7f0ec3bb017aef0f5a0f2259afa0e0f0a`

## Objective

Build a reproducible, evidence-based comparison of:

- Codex, Claude Code, OpenCode, and Pi as coding-assistant harnesses;
- OpenAI and Anthropic frontier models;
- hosted open-weight models, particularly DeepSeek, Kimi, and Qwen;
- assistant features, plugins, skills, MCP servers, hooks, permissions, and
  multi-agent workflows;
- a distributed workflow in which a frontier model plans and reviews while a
  smaller or less expensive model implements bounded tasks.

The research rules and comparison lanes are defined in
[`benchmark/STUDY.md`](benchmark/STUDY.md). Do not mix assistant effects with
model effects, and do not modify a frozen task or rubric after recorded runs
have started.

## Active focus: frontier models first

On 2026-08-23, the user clarified that the project must focus primarily on the
top OpenAI and Anthropic models, not become a broad open-model survey. The core
new-task lineup is:

1. Codex + GPT-5.6 Sol;
2. Claude Code + Claude Fable 5, subject to account access and credit approval;
3. OpenCode + Kimi K3 as the main top open-model challenger; and
4. OpenCode + Qwen3.8-27B as the smaller efficiency control.

Claude Opus 5 is the declared Anthropic fallback if Fable 5 is unavailable.
DeepSeek V4 Pro is the declared open-model alternate. Do not silently
substitute either one. Existing DeepSeek V4 Flash and Kimi K2.7 results remain
valid lower-cost worker evidence but are no longer the headline comparison.

This decision is recorded in
[`benchmark/decisions/2026-08-23-frontier-first-focus.md`](benchmark/decisions/2026-08-23-frontier-first-focus.md).

### Three-harness clarification

Codex, Claude Code, and OpenCode are all primary harnesses being evaluated. The
study must compare the tool around the model, not only model quality. OpenCode
requires an explicit adoption verdict: primary tool, useful secondary tool, or
not worth the setup yet.

Use both a shared-model block across all three harnesses and a top-native-model
block. The shared-model block isolates harness behavior; the native block shows
the strongest real product experience. The complete current program is in
[`benchmark/PROGRAM.md`](benchmark/PROGRAM.md).

## Setup completed

- Codex is installed and authenticated through the user's subscription.
- Claude Code `2.1.241` is installed and authenticated through the user's Pro
  subscription. Its CLI accepts the planned `claude-fable-5` route, but exact
  account entitlement remains untested because that requires an inference call
  which may consume usage credits.
- OpenCode, Pi, and Ollama are installed.
- Ollama Cloud access works with `deepseek-v4-flash:cloud`.
- `kimi-k2.7-code:cloud` is configured as a second hosted open-weight model.
- OpenCode's checked-in provider configuration is in [`opencode.json`](opencode.json).
- An OpenRouter account and restricted API key have been created. OpenCode
  reports the OpenRouter credential as connected. The key remains in OpenCode's
  private user credential store and is not present in the repository.
- The project configuration includes `openrouter/qwen/qwen3.8-27b`.
- The benchmark runner records an `openrouter/...` route with the `api` access
  path, keeping it distinct from subscription and Ollama Cloud runs.
- The benchmark runner creates isolated detached Git worktrees, captures the
  evidence, and removes the temporary worktrees afterward.
- No API keys or account credentials are stored in this repository.

The latest non-billing access check is recorded in
[`benchmark/access/2026-08-23-top-model-access.md`](benchmark/access/2026-08-23-top-model-access.md).

The machine is an Apple M4 MacBook Air with 16 GB memory. Large local models are
therefore outside the main study; hosted inference is the default for them.

## Work completed

### Research plan and harness

- The interactive HTML study plan is implemented in `app/`.
- The reproducible study contract is in `benchmark/STUDY.md`.
- Machine-readable task, run, and result schemas are in `benchmark/schemas/`.
- The environment, validation, and execution utilities are in `scripts/`.
- T1, T2, and T3 have frozen prompts, rubrics, fixtures, and graders.
- Raw run evidence is preserved locally under `benchmark/runs/`. Those
  directories are intentionally Git-ignored and have not been deleted.

### T1: read-only repository analysis

The four assistants used the same DeepSeek V4 Flash model through Ollama Cloud.
All passed without workspace changes or intervention. Scores were Codex 95,
OpenCode 94, Pi 92, and Claude Code 92. This is a one-run pilot, not a general
ranking. Full evidence summary:
[`benchmark/reports/T1-shared-model-pilot.md`](benchmark/reports/T1-shared-model-pilot.md).

### T2: bounded bug fix

OpenCode, Codex, and Claude Code all scored 100/100 using DeepSeek V4 Flash.
Each produced the same minimal patch and stayed within the one-file scope. Full
summary:
[`benchmark/reports/T2-shared-model-pilot.md`](benchmark/reports/T2-shared-model-pilot.md).

### T3: multi-file implementation

Eight counted runs compared three harnesses with DeepSeek and Kimi plus the
native Codex and Claude subscription defaults. All implementations passed every
functional check. Seven runs passed the complete contract; Codex + DeepSeek
failed only because a project-wide typecheck generated an out-of-scope
`tsconfig.tsbuildinfo` file. OpenCode was the fastest clean harness for both
open-model routes. Full matrix:
[`benchmark/reports/T3-model-harness-matrix.md`](benchmark/reports/T3-model-harness-matrix.md).

The subscription-backed Claude run reported `claude-sonnet-5`. The Codex event
stream did not expose an exact served-model identifier, so its report correctly
uses `subscription-default` rather than guessing.

Raw token and cost telemetry is not yet suitable for rankings because the
assistant adapters count cached input, repeated context, and provider estimates
differently.

## Qwen3.8-27B research decision

The recently released model discussed in the project is most likely
**Qwen3.8-27B**. It is a dense, open-weight 27B model aimed at coding, tool use,
long-context work, and agent execution. It has a native 262,144-token context
window. The official model card is:
[Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B).

Current access findings as of 2026-08-22:

- **Recommended practical route:** OpenRouter model ID
  `qwen/qwen3.8-27b`. It is pay per token and exposes an OpenAI-compatible API,
  making it suitable for an OpenCode model pilot without local hosting.
  [OpenRouter model page](https://openrouter.ai/qwen/qwen3.8-27b).
- The observed OpenRouter list price was approximately $0.40 per million input
  tokens and $3.00 per million output tokens. Pricing must be checked again
  before recorded runs.
- Fireworks has the exact model at
  `accounts/fireworks/models/qwen3p8-27b`, but it currently requires an
  on-demand dedicated deployment rather than ordinary serverless use. That is
  likely excessive for this study.
  [Fireworks model page](https://fireworks.ai/models/fireworks/qwen3p8-27b).
- Ollama lists local `qwen3.8:27b`, approximately 18 GB, but no corresponding
  Ollama Cloud tag was available. Do not download it to this laptop for the
  core study. [Ollama model page](https://ollama.com/library/qwen3.8).
- The official Qwen-managed cloud version was described as coming soon on the
  model card.

Qwen3.8-27B should be added as a separate model pilot. It should not be inserted
retroactively into an existing T1-T3 comparison block. The account, key, and
minimal connectivity call are now complete. Any increase to the agreed small
spending limit or addition of another paid provider still requires the user's
explicit approval. Never paste an API key into a chat or commit it to the
repository.

### Connectivity result

On 2026-08-23, OpenCode `1.18.21` successfully called
`openrouter/qwen/qwen3.8-27b` with all tools disabled and received the exact
requested fixed response. OpenCode reported 2,364 input tokens, 10 output
tokens, 73 reasoning tokens, and a cost of $0.0011946. This was a connectivity
check, not a counted benchmark. See
[`benchmark/reports/QWEN-OPENROUTER-SETUP.md`](benchmark/reports/QWEN-OPENROUTER-SETUP.md).

### First Qwen benchmark result

OpenCode + Qwen3.8-27B passed frozen T1 on 2026-08-23 with a manual score of
93/100. The isolated read-only run finished in 141.210 seconds, made no
workspace changes, used 352,593 reported input tokens and 3,955 output tokens,
and cost $0.1632682 according to OpenCode. Its strongest areas were architecture,
request flow, and the change plan. It lost points because one risk inferred a
dirty checkout from a stale resume instruction even though the recorded
baseline was clean. See
[`benchmark/reports/T1-qwen-openrouter-pilot.md`](benchmark/reports/T1-qwen-openrouter-pilot.md).

### Same-baseline T2 worker comparison

On 2026-08-23, OpenCode `1.18.21` ran Qwen3.8-27B, DeepSeek V4 Flash,
and Kimi K2.7 Code once each on frozen T2 from commit `67d434e`. The run order
was preregistered as Qwen, DeepSeek, then Kimi. All three scored 100/100,
produced the same minimal patch, passed 2/2 visible and 5/5 private tests, stayed
within the one-file scope, and required no intervention.

Kimi was fastest at 7.092 seconds, DeepSeek took 7.528 seconds, and Qwen took
37.815 seconds. Qwen cost $0.0090234 according to OpenCode; the Ollama routes
reported zero, which is not treated as proof of zero underlying hosting cost.
The decision is to advance Qwen to one same-baseline T3 comparison without yet
selecting a winning worker. See
[`benchmark/reports/T2-open-model-worker-comparison.md`](benchmark/reports/T2-open-model-worker-comparison.md).

### T4: responsive run explorer task pack

The first new complex task is now designed and maintainer-validated as
`T4-run-explorer@1.0.0`. It is a dependency-free HTML, CSS, and JavaScript UI
task with four editable files, one committed visible suite, a hash-locked local
private suite, strict scope, and external browser QA.

A temporary reference solution passed 6/6 visible checks, 7/7 private checks,
desktop and 390 px mobile layouts, filtering, sorting, reset, empty state,
keyboard focus, overflow, and console checks. The reference answer was then
removed, and the intentionally failing starter was restored. See
[`benchmark/reports/T4-task-design.md`](benchmark/reports/T4-task-design.md).

### T4 shared-model harness comparison

The preregistered shared-model block ran Codex, Claude Code, and OpenCode once
each with `ollama/kimi-k2.7-code:cloud` on baseline `8907158`. OpenCode was
fastest at 52.582 seconds, Claude took 54.480 seconds, and Codex took 87.538
seconds. Claude and OpenCode each reported about 112,000 total tokens; Codex
reported 265,808.

All three produced scoped interfaces that passed visible tests and external
desktop/mobile browser QA. The raw runner marked Codex and Claude as failures
because a private source check accidentally required a CSS class matching
`.outcome`; both used `.run-outcome` while still rendering visible Pass/Fail
text. OpenCode happened to use `.outcome`. The frozen result is preserved and
was not rerun. Treat this block as a three-way contract pass with a contaminated
raw pass/fail signal. Full evidence:
[`benchmark/reports/T4-shared-harness-comparison.md`](benchmark/reports/T4-shared-harness-comparison.md).

The preliminary OpenCode verdict is now **worth exploring / useful secondary
tool**, not yet primary-tool adoption.

### T4 top-native comparison

The corrected `T4-run-explorer-v2@1.0.1` block ran on baseline `d72825c` with no
reruns or human interventions. Codex + GPT-5.6 Sol, OpenCode + Kimi K3, and
Claude Code + Opus 5 each scored 100 and passed automated plus browser checks.
Kimi was fastest at 221.644 seconds and cost `$0.5790162`; Codex took 350.694
seconds; Opus took 483.388 seconds.

OpenCode + Qwen3.8-27B hit the fixed 20-minute timeout. Its saved three-file UI
worked in the browser, but it never added student tests or a final report and
received a post-timeout score of 87. Total OpenRouter access-check and counted
spend was `$0.758898` of the approved `$1.50` ceiling.

Fable 5 remains an explicit access limitation because usage credits are
disabled. Opus 5 is labeled as the best accessible Claude route, not Fable.

The OpenCode verdict is now **strong secondary tool and serious pilot
candidate**. Kimi shows that it can deliver a top result; Qwen shows that model
choice remains decisive. Full evidence:
[`benchmark/reports/T4-top-native-comparison.md`](benchmark/reports/T4-top-native-comparison.md).

## Selected distributed workflow

### T5 all-assistant result

The first distributed workflow is complete on the frozen cross-layer
`T5-review-queue` task:

1. Codex/GPT-5.6 Sol planned read-only.
2. Claude Code/Opus 5 challenged and corrected the plan read-only.
3. OpenCode/Kimi K3 implemented all five owned files.
4. Codex integrated and ran the gate without changing the worker patch.
5. Claude performed a final read-only review and returned `pass`.
6. The private harness graded the saved patch.

The distributed result scored 100 and passed 9/9 visible plus 7/7 corrected
private checks in 536.704 seconds. Kimi finished its stage in 112.515 seconds
for `$0.6175818`; Codex made zero integration edits, so the accepted
implementation is fully attributable to the open worker.

The solo Codex/GPT-5.6 Sol control also scored 100 after a grader correction,
passing 8/8 visible and 7/7 corrected private checks in 150.206 seconds. The
raw private suite failed only because it required the spelling `in-memory`
while the README used `in memory` and correctly documented non-durability plus
reset-on-restart. The raw fail is preserved; neither patch was edited or rerun.

The distributed route was 3.57 times slower and did not improve final quality.
It did demonstrate auditability, useful plan challenge, and successful bounded
delegation to OpenCode/Kimi. Use this pattern for high-review work, not as the
default for every bounded feature. Full evidence:
[`benchmark/reports/T5-distributed-workflow-comparison.md`](benchmark/reports/T5-distributed-workflow-comparison.md).

The first workflow attempt is separately preserved as a harness failure:
Claude's special plan mode tried to write a user plan file through a read-only
adapter and timed out before Kimi started. V2 changed only the read-only Claude
adapter; no paid call occurred in attempt 1.

Cumulative OpenRouter spend is now `$1.3764798` of the approved `$1.50`
ceiling, leaving `$0.1235202`. Do not make another paid model call or increase a
provider limit without a new explicit approval.

## Exact next steps

1. Commit the verified T5 corrected grader, result JSON, comparison report, and
   updated handoff.
2. Build the common harness-feature checklist for Codex, Claude Code, and
   OpenCode: permissions, planning, resume/recovery, plugins/skills/hooks/MCP,
   browser support, telemetry, configuration, and error handling.
3. Design and freeze T6, the incident/debugging task, before another model sees
   it. Use subscription routes first because only `$0.1235202` remains under
   the OpenRouter ceiling.
4. Decide whether the next paid block is worth a new explicit budget. Do not
   increase a provider limit automatically.
5. Run repeated randomized trials only where they can change a decision; one
   task is not a general winner.

## Verification commands

```bash
npm run benchmark:env
npm run benchmark:validate
npm run typecheck
npm run lint
npm test
npm run verify
```

Preview a benchmark command without executing a recorded run:

```bash
npm run benchmark:run -- --assistant opencode --task T1-repo-map
```

## Resume instruction

When work resumes, start with:

> Read `AGENTS.md`, `RESUME.md`, `benchmark/STUDY.md`, and the reports in
> `benchmark/reports/`. Confirm the Git state and run `npm run verify`. Then
> continue from the first unfinished item under **Exact next steps**. The
> OpenRouter Qwen route is configured and its minimal connectivity check has
> passed; do not increase its spending limit without my explicit approval.
