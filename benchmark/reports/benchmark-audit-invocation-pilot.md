# Portable extension invocation pilot

Date: 2026-08-23

## Result

The shared extension worked end to end in **OpenCode and Codex**. Claude Code
discovered the skill and connected the MCP server, but its frozen `dontAsk`
configuration denied both read-only MCP calls. The block therefore has two
passes and one preserved harness-configuration failure.

This is feature evidence, not a model-quality ranking. All routes used the same
prompt and target run on baseline `8c940ae`, but their models and access paths
were deliberately the existing practical product routes.

| Route | Result | Time | Skill evidence | MCP result | Other tools |
|---|---:|---:|---|---|---|
| OpenCode 1.18.21 + Kimi K2.7 Code/Ollama Cloud | Pass | 6.938 s | Discovered and invoked once | Both calls succeeded once | None |
| Codex 0.146.0-alpha.3.1 + GPT-5.6 Sol | Pass | 20.762 s | Separate load event unavailable | Both calls succeeded once | None |
| Claude Code 2.1.241 + Opus 5 | Fail | 22.921 s | Discovered and invoked once | Connected, then both calls denied | None |

OpenCode and Codex returned all four required sections and every requested fact:
the exact baseline, both prompt-integrity flags, three changed paths, no
out-of-scope path, passing visible and private command-level checks, all eight
expected artifacts, assistant/model/access data, and 129.209-second source-run
latency. Both correctly said the MCP response did not supply comparable token
or metered-cost totals.

Claude's final answer was honest and well controlled. It returned
`insufficient evidence`, described the two denials, invented no audit facts,
and did not fall back to shell or file tools. That is good recovery behavior,
but it is still a failed invocation because neither required MCP operation
executed.

## Permission finding

Claude's initialization event listed the `benchmark-audit` server as connected,
the skill as available, and both MCP tools as exposed. The runner used
`--permission-mode dontAsk` and `--tools` to limit the available surface. In
this configuration, availability did not preauthorize execution, so Claude
Code denied both calls rather than asking.

The correction is small and should be tested in a separately frozen recovery
block: retain `dontAsk`, retain the narrow `--tools` list, and add the two MCP
names to `--allowedTools`. Do not rewrite or rerun this block.

## Grading correction

The first feature-runner version marked Claude as an automatic pass because it
counted tool-use requests without inspecting their error results. The raw event
stream and original result remain preserved. The normalized result changes the
lane to fail, and the runner now requires every required tool call to return
without an error. No assistant was rerun to make the evidence cleaner.

## Telemetry

| Route | Reported usage | Cost interpretation |
|---|---|---|
| OpenCode/Kimi | 13,049 input; 662 output across three step records | OpenCode reported `0`; this is not proof of zero Ollama hosting cost. |
| Codex/Sol | 44,534 input; 26,112 cached subset; 781 output; 317 reasoning subset | Subscription; no cost field exposed. |
| Claude/Opus | 6 input; 9,731 cache creation; 17,336 cache read; 1,464 output; 206 thinking | `$0.143868` CLI subscription telemetry, not metered spend. |

The adapters use different cache and total definitions. These values must not
be collapsed into one cross-product efficiency score.

No OpenRouter request occurred. Cumulative OpenRouter spend remains
`$1.3764798`, leaving `$0.1235202` under the approved ceiling.

## Conclusion

The portable architecture is viable: one dependency-free MCP server delivered
the same bounded evidence in Codex and OpenCode, and all three products found
the shared extension surface. The most important operational lesson is that
connection, discovery, availability, and permission are four different checks.
The harness must record each separately.

Full normalized evidence is in
[`benchmark-audit-invocation-2026-08-23.results.json`](../blocks/benchmark-audit-invocation-2026-08-23.results.json).
