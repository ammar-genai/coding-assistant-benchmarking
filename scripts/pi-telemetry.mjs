import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function summarizePiJsonl(source) {
  const events = source
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new SyntaxError(`Invalid Pi JSON on line ${index + 1}: ${error.message}`);
      }
    });

  const session = events.find((event) => event.type === "session");
  let finalAssistantMessage = null;
  let firstEditRequestedAt = null;
  const toolCalls = [];
  let toolErrors = 0;

  for (const event of events) {
    if (event.type === "message_end" && event.message?.role === "assistant") {
      finalAssistantMessage = event.message;
      if (firstEditRequestedAt === null && event.message.content?.some(
        (item) => item.type === "toolCall" && (item.name === "edit" || item.name === "write"),
      )) firstEditRequestedAt = event.message.timestamp ?? null;
    }
    if (event.type === "tool_execution_start") {
      toolCalls.push(event.toolName ?? "unknown");
    }
    if (event.type === "tool_execution_end" && event.result?.isError === true) {
      toolErrors += 1;
    }
  }

  const usage = finalAssistantMessage?.usage ?? {};
  const sessionStartedAt = session?.timestamp ? Date.parse(session.timestamp) : null;

  return {
    provider: finalAssistantMessage?.provider ?? null,
    requested_model: finalAssistantMessage?.model ?? null,
    served_model: finalAssistantMessage?.responseModel ?? null,
    stop_reason: finalAssistantMessage?.stopReason ?? null,
    usage: {
      input: usage.input ?? null,
      output: usage.output ?? null,
      cache_read: usage.cacheRead ?? null,
      cache_write: usage.cacheWrite ?? null,
      reasoning: usage.reasoning ?? null,
      total_tokens: usage.totalTokens ?? null,
    },
    reported_cost_usd: usage.cost?.total ?? null,
    tool_calls: toolCalls.length,
    tool_calls_by_name: Object.fromEntries(
      [...new Set(toolCalls)].sort().map((name) => [name, toolCalls.filter((value) => value === name).length]),
    ),
    tool_errors: toolErrors,
    first_edit_request_ms: firstEditRequestedAt !== null && Number.isFinite(sessionStartedAt)
      ? firstEditRequestedAt - sessionStartedAt
      : null,
  };
}

function main() {
  const [inputPath] = process.argv.slice(2);
  if (!inputPath) {
    console.error("Usage: node scripts/pi-telemetry.mjs <pi-stdout-jsonl>");
    process.exitCode = 2;
    return;
  }
  console.log(JSON.stringify(summarizePiJsonl(readFileSync(inputPath, "utf8")), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
