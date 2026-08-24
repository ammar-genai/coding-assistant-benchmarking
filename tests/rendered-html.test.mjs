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

test("server-renders the coding intelligence research showcase", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Coding Intelligence Field Study \| Assistants, Models, Orchestration<\/title>/i);
  assert.match(html, /How coding assistants/);
  assert.match(html, /The strongest setup is a portfolio, not a winner/);
  assert.match(html, /Separate the product from the model/);
  assert.match(html, /End-to-end study flow/);
  assert.match(html, /T5 internal workflow/);
  assert.match(html, /Repeated for every counted observation/);
  assert.match(html, /20 counted observations/);
  assert.match(html, /Open the task behind every result/);
  assert.match(html, /Evidence index \/ T1–T10/);
  assert.match(html, /Concurrent event projector/);
  assert.match(html, /href="\/tasks\/#t10"/);
  assert.match(html, /Browse all public task briefs/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\/ammar-genai\/coding-assistant-benchmarking/);
  assert.match(html, /GPT-5\.6 Sol/);
  assert.match(html, /Claude Fable 5/);
  assert.match(html, /Qwen3\.8-27B/);
  assert.match(html, /Five models\. One neutral Pi harness/);
  assert.match(html, /3\.57×/);
  assert.match(html, /55\.115 s/);
  assert.match(html, /Frontier judgment at the top/);
  assert.match(html, /Evidence before impressions/);
  assert.match(html, /Observed account decrease/);
  assert.match(html, /Enter the research lab/);
  assert.match(html, /The evidence became working software/);
  assert.match(html, /property="og:image" content="http:\/\/localhost:3000\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.match(html, /Read the research paper/);
  assert.doesNotMatch(html, /class="tc-shell"/);
});

test("server-renders the self-contained public task briefs", async () => {
  const response = await render("/tasks");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>T1–T10 Public Task Briefs \| Coding Intelligence Field Study<\/title>/i);
  assert.match(html, /The work behind/);
  assert.match(html, /every score/);
  assert.match(html, /Map an unfamiliar repository/);
  assert.match(html, /Securitized-product trade capture/);
  assert.match(html, /Repair a concurrent event projector/);
  assert.match(html, /Authoritative private source paths/);
  assert.match(html, /benchmark\/tasks\/T10-event-projector\/prompt\.md/);
  assert.match(html, /No hidden tests, raw transcripts, credentials, or private run evidence/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\/ammar-genai\/coding-assistant-benchmarking/);
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
  assert.match(html, /Ticket ready for input/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Book trade<\/button>/);
  assert.match(html, /Complete required fields and resolve validation errors before booking/);
  assert.doesNotMatch(html, /aria-invalid="true"/);
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
  assert.match(html, /role="region" aria-label="Trade blotter table" tabindex="0"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /id="tc-ticket-title" tabindex="-1"/);
  assert.match(html, /id="tc-review-title" tabindex="-1"/);
});

test("server-renders the research application lab", async () => {
  const response = await render("/lab");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();

  assert.match(html, /The work behind/);
  assert.match(html, /Trade Capture Workspace/);
  assert.match(html, /Neutral Pi Harness/);
  assert.match(html, /Read-only Audit MCP/);
  assert.match(html, /A five-step audience demo/);
});
