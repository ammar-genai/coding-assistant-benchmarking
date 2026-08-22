# Coding Assistant Study Plan

An interactive six-week playbook for comparing:

- Codex, Claude Code, and OpenCode as coding assistants
- Pi as a neutral model harness
- OpenAI and Anthropic frontier models
- DeepSeek and Kimi through Ollama Cloud, plus a small local Qwen control
- Skills, plugins, MCP servers, hooks, permissions, and multi-agent workflows

The plan separates assistant effects from model effects, defines a 94-run core
study, and ends with a distributed project led by a frontier model and completed
by smaller workers.

## Local use

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. Progress checkboxes are stored only in
the browser on that device. Use the **Print / save PDF** action for a static copy.

## Verification

```bash
npm run verify
```

## Benchmark setup

The reproducible study contract is in `benchmark/STUDY.md`. The first frozen
task is a read-only repository analysis with a 100-point rubric.

```bash
npm run benchmark:env
npm run benchmark:validate
npm run benchmark:run -- --assistant opencode
```

The last command is a safe preview. Add `--execute` to create a unique evidence
folder in `benchmark/runs/`. Generated runs are ignored by Git and never
overwritten.

Model and product details in the plan were researched on August 22, 2026. Record
the exact assistant version and model ID again before every study block.
