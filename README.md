# Coding Intelligence Field Study

This repository is the complete private archive of a two-phase applied study of coding assistants, frontier models, open-weight models, neutral model harnesses, and distributed AI development.

The project moved from controlled assistant benchmarks to a neutral five-model comparison, then turned the evidence into a research website, a working securitized-products trade-capture mock, a research paper, and a presentation deck.

## Published showcase

- [Research website](https://ammar-genai.github.io/coding-intelligence-field-study/)
- [End-to-end study flow](https://ammar-genai.github.io/coding-intelligence-field-study/#study-flow)
- [Research Lab](https://ammar-genai.github.io/coding-intelligence-field-study/lab/)
- [Trade Capture application](https://ammar-genai.github.io/coding-intelligence-field-study/trade-capture/)
- [Public compiled-site repository](https://github.com/ammar-genai/coding-intelligence-field-study)

The public repository contains only compiled presentation artifacts. This private repository preserves the source, benchmark evidence, private checks, reports, and reproducibility tooling.

## Start here

- [`ARTIFACTS.md`](ARTIFACTS.md) — complete archive map and preservation boundary
- [`benchmark/reports/phase-1/PHASE-1-COMPREHENSIVE.md`](benchmark/reports/phase-1/PHASE-1-COMPREHENSIVE.md) — detailed assistant-product study
- [`benchmark/reports/phase-2/PHASE-2-COMPREHENSIVE.md`](benchmark/reports/phase-2/PHASE-2-COMPREHENSIVE.md) — detailed neutral Pi model comparison
- [`benchmark/reports/final-study-report.md`](benchmark/reports/final-study-report.md) — cross-phase findings
- [`RESUME.md`](RESUME.md) — chronological project record and continuation context

## What was evaluated

Phase 1 treated Codex, Claude Code, and OpenCode as complete coding-assistant products. Tasks progressed from repository analysis through bounded fixes, UI work, concurrency debugging, portable skills and MCP integration, and a distributed trade-capture build.

Phase 2 held the Pi harness, prompts, provider, tools, timeouts, and intervention policy fixed while comparing five model routes across 20 counted observations. It measured quality, acceptance, elapsed time, reported cost, reliability, and scope discipline.

## Applications and publications

- `app/` — research showcase, Research Lab, and trade-capture application
- `output/pdf/` — research paper
- `output/presentation/` — presentation deck
- `public/` — deployable paper, deck, social card, and application imagery

## Reproduce and verify

```bash
npm install
npm run verify
npm run benchmark:phase2:validate
```

Run the local site with:

```bash
npm run dev
```

The benchmark contracts, recorded results, and saved evidence are historical artifacts. Do not rewrite a completed run; create a new versioned study block instead.
