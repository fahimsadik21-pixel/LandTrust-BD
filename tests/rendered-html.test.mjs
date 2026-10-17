import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the LandTrust BD prototype shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>LandTrust BD/);
  assert.match(html, /LandTrust BD/);
  assert.match(html, /জমি যাচাই শুরু করুন/);
  assert.match(html, /১৭ অক্টোবর ২০২৬/);
  assert.match(html, /bangladesh-village\.jpg/);
  assert.doesNotMatch(html, /LandTech 2026 · P3 Hackathon Prototype/);
  assert.doesNotMatch(html, /সহায়তা: 16122/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});
