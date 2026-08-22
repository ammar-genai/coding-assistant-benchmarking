import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  assert.match(html, /<title>Coding Assistant Study Plan<\/title>/i);
  assert.match(html, /Find the right/);
  assert.match(html, /94 core runs/);
  assert.match(html, /GPT-5\.6 Sol/);
  assert.match(html, /Claude Opus 5/);
  assert.match(html, /DeepSeek V4 Flash Cloud/);
  assert.match(html, /Begin with Day 1/);
  assert.match(html, /Primary sources used for this plan/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});
