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

## Setup completed

- Codex is installed and authenticated through the user's subscription.
- Claude Code is installed and its subscription login has been completed.
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

## Selected distributed workflow

The evidence from T3 supports the following first controlled distributed test:

1. Claude Code with its subscription frontier model creates a read-only plan
   and acceptance checklist for a new T4 task.
2. OpenCode + Kimi K2.7 Code implements the bounded change in an isolated
   worktree.
3. Claude reviews the patch and visible test evidence without access to private
   tests.
4. Kimi receives at most one repair pass.
5. The private grader decides the final outcome.

Run Claude alone on the same T4 task as the control. Compare final score, total
elapsed time, frontier-model time, repair count, scope control, and human
interventions. Later, repeat the workflow with OpenAI and Anthropic lead/reviewer
roles reversed.

Qwen3.8-27B can be evaluated first as an additional OpenCode worker on an
already-frozen task. If it passes that pilot, create a later distributed-study
block comparing Kimi and Qwen workers under the same frontier plan.

## Exact next steps

1. Review and deliberately commit the prepared setup documentation, OpenCode
   provider entry, and benchmark-runner access-path change. A recorded run
   requires a named clean Git baseline.
2. Run OpenCode + Qwen3.8-27B on frozen T1 as the first isolated, read-only
   Qwen pilot.
3. Grade and report the Qwen T1 evidence without combining it with earlier
   study blocks.
4. Run the existing verification commands to confirm the saved baseline is
   healthy.
5. Design and manually solve T4 as a small UI task with desktop and mobile
   checks, accessibility checks, strict file ownership, visible tests, and
   private acceptance checks.
6. Freeze and commit the T4 contract before any model sees it.
7. Run the Claude single-agent control.
8. Run the Claude-plan, Kimi-implementation, Claude-review workflow.
9. Do not make cost or winner claims until there are repeated randomized runs
   and normalized telemetry.

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
