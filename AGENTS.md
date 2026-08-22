# Coding Assistant Benchmark

This repository contains an interactive study plan and the reproducible harness used to compare coding assistants and models.

## Working rules

- Treat `benchmark/STUDY.md` and every versioned task contract as frozen evidence. Change them only when the user is deliberately creating a new study version.
- Keep assistant prompts identical inside a comparison lane. Put assistant-specific launch details in the runner, not in task prompts.
- Never place credentials, tokens, account details, or private source code in prompts or saved run artifacts.
- Recorded runs must start from a named repository state and use a fresh session. Do not overwrite an existing run directory.
- A read-only task must not change the target workspace. A changed file makes that run fail even if the written answer is good.
- Do not commit, merge, push, deploy, install external services, or perform destructive cleanup unless the user explicitly requests it.
- Preserve unrelated work and report every verification failure or unresolved risk.

## Project map

- `app/`: interactive HTML study plan.
- `benchmark/STUDY.md`: fixed research contract and comparison lanes.
- `benchmark/tasks/`: versioned task prompts, contracts, and rubrics.
- `benchmark/schemas/`: machine-readable task, run, and result formats.
- `benchmark/runs/`: generated evidence; ignored by Git except for its placeholder.
- `scripts/benchmark-*.mjs`: environment, validation, and run utilities.

## Standard commands

```bash
npm run benchmark:env
npm run benchmark:validate
npm run benchmark:run -- --help
npm run typecheck
npm run lint
npm test
npm run verify
```

Use `npm run benchmark:run -- --assistant opencode --task T1-repo-map` to preview a command. Add `--execute` only when a recorded run is intended.
