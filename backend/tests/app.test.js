const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
async function withApp(client, run) {
  const server = createApp({ clientOrigins: ["http://localhost:3000"], publicBaseUrl: "https://example.com", clientFactory: () => client }).listen(0);
  await new Promise(resolve => server.once("listening", resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test("health checks the database and identifies Supabase", async () => {
  await withApp({ from: table => { assert.equal(table, "vehicles"); return { select: () => ({ limit: async () => ({ data: [], error: null }) }) }; } }, async base => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).provider, "supabase");
  });
});
test("malformed JSON and disallowed origins return client errors", async () => {
  await withApp({}, async base => {
    const malformed = await fetch(`${base}/api/auth/register`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).success, false);
    const forbidden = await fetch(`${base}/api/health`, { headers: { origin: "https://untrusted.example" } });
    assert.equal(forbidden.status, 403);
  });
});
test("login preserves rate-limit errors instead of blaming the password", async () => {
  await withApp({ auth: { signInWithPassword: async () => ({ data: null, error: { status: 429, code: "over_request_rate_limit" } }) } }, async base => {
    const response = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "test@example.com", password: "valid-password" }) });
    assert.equal(response.status, 429);
    assert.match((await response.json()).message, /wait/);
  });
});
test("missing schema is unavailable rather than healthy", async () => {
  await withApp({ from: () => ({ select: () => ({ limit: async () => ({ error: { code: "PGRST205" } }) }) }) }, async base => {
    assert.equal((await fetch(`${base}/api/health`)).status, 503);
  });
});
test("anonymous requests cannot access protected resources", async () => {
  await withApp({}, async base => {
    for (const path of ["/orders", "/bookings", "/favourites", "/listings", "/support", "/admin/summary", "/auth/me"]) assert.equal((await fetch(`${base}/api${path}`)).status, 401);
    assert.equal((await fetch(`${base}/api/missing`)).status, 404);
  });
});
test("forged bearer tokens are rejected", async () => {
  await withApp({ auth: { getUser: async () => ({ data: { user: null }, error: new Error("invalid") }) } }, async base => {
    assert.equal((await fetch(`${base}/api/orders`, { headers: { authorization: "Bearer forged" } })).status, 401);
  });
});
test("signup without a session requires email confirmation", async () => {
  await withApp({ auth: { signUp: async () => ({ data: { user: { id: "test-user", email: "test@example.com" }, session: null }, error: null }) } }, async base => {
    const response = await fetch(`${base}/api/auth/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Test User", email: "test@example.com", password: "valid-password" }) });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.confirmationRequired, true);
    assert.equal(body.token, undefined);
  });
});
