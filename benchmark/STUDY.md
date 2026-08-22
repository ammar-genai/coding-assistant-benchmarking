# Coding Assistant and Model Study

Study version: `1.0.0-draft`  
Started: `2026-08-22`  
Status: setup and pilot

## Question

Which coding assistant is most effective around a fixed model, which model is most effective inside a fixed harness, and which native assistant-model pairing is best for real work?

The study separates those questions. A model result must not be presented as an assistant result, and an assistant result must not be presented as a model result.

## Available environment

- Apple M4 MacBook Air, 16 GB memory.
- Codex CLI with an active ChatGPT subscription session.
- Claude Code with an active Pro subscription session.
- OpenCode, Pi, and Ollama.
- Ollama Cloud access verified with `deepseek-v4-flash:cloud`.
- `kimi-k2.7-code:cloud` registered as the second hosted open-weight model.
- `qwen3:8b` available only as a small local side test. Large local models are outside the core study on this machine.

Record the exact versions, full model IDs, reasoning setting, and access method again at the start of every study block.

## Comparison lanes

### Lane A — assistant comparison

Hold the model fixed and compare Codex, Claude Code, OpenCode, and Pi. The shared baseline is `deepseek-v4-flash:cloud` through Ollama. Use the same task prompt, repository state, model, context, tool permissions, time limit, and number of runs.

This lane answers how much value comes from the surrounding assistant: planning, repository discovery, tool calls, permissions, recovery, output quality, and required intervention.

Before the full lane, verify that every assistant can use the same Ollama model. If one cannot, report it as an access limitation; do not silently substitute another model.

### Lane B — model comparison

Hold the harness fixed. Use Pi as the intended neutral harness after its Ollama and subscription-backed providers are verified. Start with:

- OpenAI frontier lead and workhorse models available in the Codex account.
- Anthropic frontier lead and workhorse models available in the Claude Code account.
- `deepseek-v4-flash:cloud`.
- `kimi-k2.7-code:cloud`.
- One Qwen coding model from Ollama Cloud if available under the study budget.
- `qwen3:8b` only as an explicitly labeled small local control.

If subscription authentication cannot be reused by Pi, keep the subscription-only runs in a separate access lane or add paid API access only after the user approves a budget.

### Lane C — native product comparison

Use each product with its strongest normal pairing: Codex with the chosen OpenAI frontier model, Claude Code with the chosen Anthropic frontier model, and OpenCode with the best hosted open-weight model from the pilot. Fairness is less important here than measuring the product a developer would actually choose.

## Core task pack

1. T1: map an unfamiliar repository without editing it.
2. T2: diagnose and fix a seeded edge-case bug.
3. T3: build a multi-file feature with tests and documentation.
4. T4: build and verify a user interface on desktop and mobile.

Challenge tasks T5–T8 cover behavior-preserving refactoring, dependency migration, incident/security investigation, and CI/project-guidance repair. Create those only after T1–T4 complete a clean pilot.

## Run contract

Every recorded run must:

1. Start from the same named Git commit or immutable fixture version.
2. Use a new assistant session and a unique run ID.
3. Use the versioned task prompt without assistant or model names inside it.
4. Save assistant version, exact model ID, access path, settings, prompt hash, start/end times, exit status, output, workspace changes, tests, interventions, and grader notes.
5. Stop at the task time limit or intervention limit.
6. Preserve failures and partial outputs. Never replace a bad run with a better run under the same ID.

For controlled Codex runs, use `--ignore-user-config` so a personal reasoning default, service tier, plugin, or MCP server does not change the lane. Authentication remains available, while task rules still come from this repository.

`status` records whether the assistant process completed. `acceptance_status` records whether the answer or patch passed the task. A completed command is not a successful benchmark result until it is graded.

Run order should be randomized within a study block. Grade from saved evidence and hide assistant/model identity where practical.

## Score

| Category | Points |
| --- | ---: |
| Correctness | 35 |
| No regressions | 15 |
| Scope discipline | 10 |
| Code quality | 10 |
| Autonomy | 8 |
| Tool and safety discipline | 7 |
| Time to accepted result | 5 |
| Usage or cost | 5 |
| Explanation and handoff | 5 |

The 100-point score is a summary. Patches, tests, transcripts, and human notes remain the evidence.

## Pilot and stop rules

- First proof: OpenCode + `deepseek-v4-flash:cloud` + T1, read-only, one run.
- Assistant pilot: four assistants × T1 and T2 × one run.
- Model pilot: selected models × T1 and T2 × one run in Pi.
- Maximum T1 wall time: 10 minutes. Maximum human interventions: zero.
- A read-only workspace change fails the run.
- A crash, refusal, quota error, authentication error, or tool loop is a recorded result, not missing data.
- Do not begin the 94-run core study until prompts, graders, reset behavior, and artifact capture work end to end.

## Distributed project

After the controlled study, run one project with a frontier lead and lower-cost workers:

1. The lead writes small versioned task contracts with owned files and acceptance checks.
2. Each worker gets a separate Git worktree and no overlapping file ownership.
3. Use hosted DeepSeek or Kimi for bounded or long worker tasks, and a stronger frontier workhorse for difficult integration.
4. A frontier model from the other vendor reviews the patches.
5. Tests and the user decide what merges. Agents do not merge, push, deploy, or hide side effects.

Repeat once with the OpenAI and Anthropic lead/reviewer roles reversed.

## Change control

Any change to a prompt, fixture, rubric, runner behavior, assistant version, or model version creates a new study block. Record the reason; do not combine incomparable blocks in one summary statistic.
