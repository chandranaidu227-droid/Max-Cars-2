import assert from "node:assert/strict";
import test from "node:test";

test("renders the MAX CARS shell and MAX 3D navigation", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
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

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html=await response.text();
  assert.match(html, /MAX CARS/);
  assert.match(html, /href="\/max-3d"/);
  assert.match(html, /<b>MAX <em>CARS<\/em><\/b>/);
  assert.doesNotMatch(html, /mc-mark\.svg/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("renders core MAX 3D and discovery routes", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("routes", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env={ASSETS:{fetch:async()=>new Response("Not found",{status:404})}};
  const ctx={waitUntil(){},passThroughOnException(){}};
  for(const path of ["/max-3d","/max-3d/showroom","/max-3d/configurator/porsche-taycan-4s","/cars/electric","/book-test-drive","/request-quote"]){
    const response=await worker.fetch(new Request(`http://localhost${path}`,{headers:{accept:"text/html"}}),env,ctx);
    assert.equal(response.status,200,`${path} should render`);
    assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
  }
});

test("renders every public navbar destination without external brand-logo dependencies", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("public-nav", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env={ASSETS:{fetch:async()=>new Response("Not found",{status:404})}};
  const ctx={waitUntil(){},passThroughOnException(){}};
  const paths=["/","/cars","/max-3d","/compare","/sell","/location","/support","/search"];
  for(const path of paths){
    const response=await worker.fetch(new Request(`http://localhost${path}`,{headers:{accept:"text/html"}}),env,ctx);
    assert.equal(response.status,200,`${path} should render`);
    const html=await response.text();
    assert.doesNotMatch(html,/cdn\.simpleicons\.org/i,`${path} must not depend on external brand-logo hotlinks`);
  }
});

test("renders the streamlined secure test-mode checkout", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("checkout", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/checkout", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Complete your reservation\./);
  assert.match(html, /Vehicle/);
  assert.match(html, /Details/);
  assert.match(html, /Payment/);
  assert.match(html, /No card data collected/);
  assert.doesNotMatch(html, /Configuration.*Dealer.*Customer.*Address.*Trade-In.*Payment.*Review.*Confirmation/s);
});
