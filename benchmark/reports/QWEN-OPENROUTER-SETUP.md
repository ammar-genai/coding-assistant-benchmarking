# Qwen3.8-27B OpenRouter setup check

Date: 2026-08-23

Harness: OpenCode `1.18.21`

Provider: OpenRouter API

Selected model: `openrouter/qwen/qwen3.8-27b`

Purpose: authentication and connectivity check only

## Configuration

The project declares Qwen3.8-27B under the built-in OpenRouter provider in
`opencode.json`. The configured conservative limits are:

- context: 262,144 tokens;
- output: 131,072 tokens.

The context value follows the currently reported top-provider limit instead of
assuming that every OpenRouter route supports the model catalog's larger
aggregate context value.

The OpenRouter credential is stored by OpenCode in its user credential store.
No key or secret is present in this repository or in the saved test evidence.

## Authentication check

`opencode auth list` reported one credential:

```text
OpenRouter api
```

The command did not display the key.

## Minimal connectivity request

The smoke test ran in `/private/tmp`, disabled all tools, used OpenCode's plan
agent, and requested one fixed response:

```text
Reply with exactly: QWEN_OPENROUTER_OK
```

The model returned:

```text
QWEN_OPENROUTER_OK
```

OpenCode reported:

| Field | Value |
| --- | ---: |
| Input tokens | 2,364 |
| Output tokens | 10 |
| Reasoning tokens | 73 |
| Total tokens | 2,447 |
| Reported cost | $0.0011946 |

This proves that the authentication path and selected model ID work. It does
not measure coding quality, tool-use quality, latency under load, or general
reliability. It is not a counted benchmark run.

## Next controlled run

After the setup changes are deliberately committed as a named baseline, run
OpenCode + Qwen3.8-27B on a frozen existing task in a fresh isolated worktree.
T1 is the lowest-risk first pilot because it is read-only. Record the exact
model route, OpenCode version, timing, usage, cost, output, and workspace hash.
