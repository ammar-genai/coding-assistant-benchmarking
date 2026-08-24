import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the coding assistant study plan", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Coding Assistant Benchmark \| Plan and Results<\/title>/i);
  assert.match(html, /Find the right/);
  assert.match(html, /Evidence status/);
  assert.match(html, /Through T6/);
  assert.match(html, /GPT-5\.6 Sol/);
  assert.match(html, /Claude Opus 5/);
  assert.match(html, /DeepSeek V4 Flash Cloud/);
  assert.match(html, /See the findings/);
  assert.match(html, /What the recorded runs actually showed/);
  assert.match(html, /3\.57×/);
  assert.match(html, /OpenCode \+ Qwen3\.8-27B/);
  assert.match(html, /T6 shared model/);
  assert.match(html, /55\.115 s/);
  assert.match(html, /One skill and MCP server worked across all three/);
  assert.match(html, /\$1\.3765/);
  assert.match(html, /property="og:image" content="http:\/\/localhost\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.match(html, /Primary sources used for this plan/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
  assert.doesNotMatch(html, /class="tc-shell"/);
});

test("server-renders the synthetic trade capture workspace", async () => {
  const response = await render("/trade-capture");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Securitized Products Trade Capture \| Synthetic Operations Lab<\/title>/i);
  assert.match(html, /Synthetic demo data only/);
  assert.match(html, /Trade ticket/);
  assert.match(html, /role="status"/);
  assert.match(html, /Today(?:&#x27;|')s synthetic securitized-product trades/);
  assert.match(html, /Trade review/);
  assert.match(html, /Active trades/);
  assert.match(html, /Gross principal/);
  assert.match(html, /tc-field-securityId/);
  assert.match(html, /<fieldset/);
  assert.match(html, /All products/);
  assert.match(html, /All statuses/);
  assert.match(html, /Largest current face/);
  assert.match(html, /SYNTH-TRADE-001/);
  assert.match(html, /Audit history/);
});
