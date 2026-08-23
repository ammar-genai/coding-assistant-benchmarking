# Coding assistant benchmark program

Program date: 2026-08-23

Status: active design for the next complex tasks

## What this project must answer

1. How does Codex differentiate itself from Claude Code as a coding-assistant
   harness?
2. How good is OpenCode as a harness, and is it worth adopting?
3. How close can a top open model get to the top OpenAI and Anthropic products?
4. Can a frontier model make the plan while a cheaper frontier or open model
   performs bounded implementation work?
5. Does distributing one project across Codex, Claude Code, and OpenCode improve
   quality or cost compared with one strong assistant doing everything?

The word **harness** applies equally to Codex, Claude Code, and OpenCode. It
means the software around the model: repository discovery, planning, tool use,
editing, permissions, test execution, recovery, context management, extensions,
and final handoff.

Pi remains useful as a neutral model runner or independent verifier, but it is
not one of the three primary products being ranked.

## The two comparisons needed for the three harnesses

### 1. Controlled harness comparison

Run Codex, Claude Code, and OpenCode with the same model, prompt, commit,
permissions, task, and time limit. This isolates what the harness contributes.

Use the highest stable shared route that all three products can actually run.
The currently verified choice is Kimi K2.7 Code through Ollama Cloud. Existing
DeepSeek V4 Flash and Kimi K2.7 evidence remains valid. If Kimi K3 later becomes
available through one identical cross-harness route, create a new block rather
than mixing it with the older shared-model results.

This comparison answers:

- Which harness maps a repository most efficiently?
- Which one plans before editing and stays within scope?
- Which one uses fewer failed or unnecessary tool calls?
- Which one handles permissions, tests, errors, and recovery best?
- Which one produces the clearest evidence and handoff?

### 2. Best native product comparison

Use each harness with its strongest normal model:

| Harness | Primary model | Purpose |
| --- | --- | --- |
| Codex | GPT-5.6 Sol | Top OpenAI coding product |
| Claude Code | Claude Fable 5 | Top Anthropic coding product |
| OpenCode | Kimi K3 | Best open-model product experience |
| OpenCode control | Qwen3.8-27B | Smaller-model efficiency check |

Claude Opus 5 is the declared fallback if Fable 5 is unavailable or requires a
budget the user declines. DeepSeek V4 Pro is the declared alternate for Kimi
K3. Never make either substitution silently.

This comparison is not intended to isolate the model. It answers which complete
tool a developer would prefer for difficult real work.

## OpenCode adoption verdict

The final report must answer **Is OpenCode worth exploring?** with one of these
plain outcomes:

1. **Primary tool** — competitive quality and reliability, with a meaningful
   advantage in model choice, cost, or workflow.
2. **Useful secondary tool** — worth keeping for open models, cheap workers, or
   special workflows, but not the best default for difficult work.
3. **Not worth the setup yet** — quality, reliability, or operating friction
   does not justify using it alongside Codex and Claude Code.

Judge OpenCode on:

- accepted-task rate and first-pass correctness;
- scope control and safety;
- speed and paid cost;
- token and cache visibility;
- model/provider flexibility;
- permission behavior;
- quality of repository search, edits, and tests;
- recovery from tool or provider failures;
- session and context management;
- configuration effort;
- plugins, agents, MCP support, and other useful extensions; and
- clarity of its transcript and final handoff.

Do not credit OpenCode for a strong model result unless the harness itself
contributed useful behavior. Do not blame OpenCode for a weak model until a
shared-model comparison supports that conclusion.

## Complex task set

Use three new tasks. Every prompt, fixture, rubric, and private check must be
frozen before the first recorded model sees it.

### T4 — user-interface feature

Build a realistic interactive feature across multiple files. Require desktop
and mobile behavior, accessibility, state handling, edge cases, automated tests,
and rendered-browser verification.

This exposes planning, visual judgment, code organization, test discipline, and
the ability to work safely in a large existing component.

### T5 — cross-layer product feature

Build a feature spanning an API route, validation, persistence or an in-memory
data layer, and a user-facing result. Require error behavior, tests, and a small
documentation change.

This exposes architecture, contract reasoning, implementation depth, and
regression control.

### T6 — maintenance and incident task

Provide failing tests, logs, and a partially misleading symptom. Require root
cause analysis, a narrow fix or behavior-preserving refactor, regression tests,
and an incident-style explanation.

This exposes debugging, restraint, recovery, and the difference between a model
that writes plausible code and a harness that guides it to verified code.

## Run plan

### Pilot

For each new task, run one attempt per primary native route:

1. Codex + GPT-5.6 Sol;
2. Claude Code + Claude Fable 5;
3. OpenCode + Kimi K3; and
4. OpenCode + Qwen3.8-27B only where the task fits the small-model-control role.

Preserve every failure. Do not rerun a failure inside the pilot block.

### Repeats

After all three task pilots, repeat only the blocks needed to check reliability,
resolve a close result, or test a meaningful failure. Randomize run order and
keep the commit and prompt fixed within each repeated block. Avoid a large run
count that adds cost without changing a decision.

### Controlled harness block

Run Codex, Claude Code, and OpenCode with Kimi K2.7 Code on at least one of the
new complex tasks. This is the direct three-harness comparison. Use the same
model access route and record any product that cannot support the required
permissions or task as an access limitation.

## Metrics

Keep outcome quality separate from operating cost. A cheap failure should not
outscore an expensive correct result, and a high-quality result should not hide
unreasonable cost.

### Quality score — 100 points

| Category | Points |
| --- | ---: |
| Correct behavior and private acceptance checks | 40 |
| No regressions and verification quality | 15 |
| Scope control and safety | 10 |
| Code quality and maintainability | 10 |
| Autonomy and recovery | 10 |
| Tool discipline | 5 |
| Task-specific UI, accessibility, or contract quality | 5 |
| Explanation and handoff | 5 |

Task-specific rubrics may redistribute points, but every report must retain the
same top-level evidence: correctness, regressions, scope, quality, autonomy,
tool discipline, and handoff.

### Operating metrics — reported separately

- accepted or failed outcome;
- total elapsed time;
- time to first meaningful edit;
- time spent in planning, implementation, tests, and repair;
- input, cached-input, output, and reasoning tokens when reported;
- provider-reported API charge;
- subscription access recorded separately from metered API cost;
- total tool calls and calls by type;
- failed commands and repeated commands;
- files read before the first edit;
- changed files and out-of-scope files;
- test runs before acceptance;
- clarification questions and human interventions;
- repair passes;
- context overflow, quota, authentication, and provider errors; and
- final response length and evidence quality.

Token fields from different adapters are not assumed comparable until their
definitions match. Preserve raw telemetry and mark missing fields as missing,
not zero. A wrapper-reported zero cost is not proof of zero underlying cost.

### Harness feature record

For Codex, Claude Code, and OpenCode, record the same checklist:

- installation and authentication effort;
- model selection and model switching;
- planning mode;
- repository instructions;
- permission and sandbox controls;
- session resume and recovery;
- parallel agents or delegation;
- skills, plugins, hooks, and MCP support;
- browser or visual-testing support;
- transcript and usage telemetry;
- error messages and debugging experience; and
- configuration portability between projects.

## Distributed project using all three assistants

Use a new project task with separable modules and one single-agent control.

### Workflow A

1. **Codex + GPT-5.6 Sol** examines the repository and writes the architecture,
   task contracts, file ownership, and acceptance checks.
2. **Claude Code + Claude Fable 5** reviews the plan before implementation and
   identifies missing risks or acceptance cases.
3. **OpenCode + the selected open worker** implements bounded, non-overlapping
   tasks in separate worktrees.
4. **Codex** integrates the approved patches and runs the full visible gate.
5. **Claude Code** performs the final independent review without seeing private
   checks.
6. The private grader and the user decide acceptance.

### Workflow B

Reverse the two frontier roles:

1. Claude plans and integrates.
2. Codex reviews the plan and performs final review.
3. OpenCode uses the same worker model and owned tasks.

This shows whether the result depends on which frontier system plans and which
one reviews.

### Distributed metrics

In addition to the normal task metrics, record:

- plan defects found before implementation;
- worker adherence to owned files and acceptance checks;
- merge conflicts and integration failures;
- review findings, confirmed defects, and false alarms;
- number of worker repair passes;
- frontier-model time and cost;
- worker-model time and cost;
- end-to-end time and cost;
- score compared with the single-agent frontier control; and
- whether distribution saved money without lowering acceptance quality.

## Final report structure

The final conclusion should answer, in this order:

1. Codex versus Claude Code: their real harness differences.
2. OpenCode: primary tool, useful secondary tool, or not worth it yet.
3. Top proprietary versus top open-model quality.
4. Cost, tokens, and time for the complex tasks.
5. Whether frontier planning plus cheaper implementation worked.
6. Whether the three-assistant distributed project beat its single-agent
   control.

Do not declare a general winner from a single small task. Lead with accepted
complex-task evidence and explain access or telemetry limitations plainly.
