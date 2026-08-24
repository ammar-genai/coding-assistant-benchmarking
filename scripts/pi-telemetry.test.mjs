import assert from "node:assert/strict";
import test from "node:test";

import { summarizePiJsonl } from "./pi-telemetry.mjs";

test("extracts final cumulative usage, tools, errors, and first edit", () => {
  const source = [
    { type: "session", timestamp: "2026-08-23T12:00:00.000Z" },
    {
      type: "message_end",
      message: {
        role: "assistant",
        content: [{ type: "toolCall", name: "read" }],
        provider: "openrouter",
        model: "model-a",
        responseModel: "served-a",
        timestamp: Date.parse("2026-08-23T12:00:01.000Z"),
        usage: { input: 10, output: 2, totalTokens: 12, cost: { total: 0.01 } },
        stopReason: "toolUse"
      }
    },
    { type: "tool_execution_start", toolName: "read" },
    { type: "tool_execution_end", toolName: "read", result: { isError: false } },
    {
      type: "message_end",
      message: {
        role: "assistant",
        content: [{ type: "toolCall", name: "edit" }],
        provider: "openrouter",
        model: "model-a",
        responseModel: "served-a",
        timestamp: Date.parse("2026-08-23T12:00:03.500Z"),
        usage: { input: 20, output: 4, cacheRead: 5, cacheWrite: 1, reasoning: 2, totalTokens: 32, cost: { total: 0.02 } },
        stopReason: "toolUse"
      }
    },
    { type: "tool_execution_start", toolName: "edit" },
    { type: "tool_execution_end", toolName: "edit", result: { isError: true } },
    {
      type: "message_end",
      message: {
        role: "assistant",
        content: [{ type: "text", text: "done" }],
        provider: "openrouter",
        model: "model-a",
        responseModel: "served-a",
        timestamp: Date.parse("2026-08-23T12:00:05.000Z"),
        usage: { input: 30, output: 8, cacheRead: 6, cacheWrite: 1, reasoning: 3, totalTokens: 48, cost: { total: 0.03 } },
        stopReason: "stop"
      }
    }
  ].map((event) => JSON.stringify(event)).join("\n");

  assert.deepEqual(summarizePiJsonl(source), {
    provider: "openrouter",
    requested_model: "model-a",
    served_model: "served-a",
    stop_reason: "stop",
    usage: { input: 30, output: 8, cache_read: 6, cache_write: 1, reasoning: 3, total_tokens: 48 },
    reported_cost_usd: 0.03,
    tool_calls: 2,
    tool_calls_by_name: { edit: 1, read: 1 },
    tool_errors: 1,
    first_edit_request_ms: 3500,
  });
});

test("rejects malformed JSONL with a useful line number", () => {
  assert.throws(() => summarizePiJsonl("{}\nnot-json"), /line 2/);
});
