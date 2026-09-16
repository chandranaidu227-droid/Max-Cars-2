// Start a production preview and an isolated Chrome debugging instance first.
// This test does not create accounts or send emails.
import assert from "node:assert/strict";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3102";
const pages = await fetch(`http://127.0.0.1:${process.env.CHROME_DEBUG_PORT || "9224"}/json`).then(r => r.json());
const target = pages.find(page => page.type === "page");
assert.ok(target, "Chrome debugging page must be available");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
let simulatedUser;
let passwordUpdateSent = false;
let signOutSent = false;
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === "Fetch.requestPaused" && simulatedUser) {
    const request = message.params.request;
    if (request.url.includes("/auth/v1/logout")) {
      if (request.method === "POST") signOutSent = true;
      void send("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204, responseHeaders: [
        { name: "Access-Control-Allow-Origin", value: base },
        { name: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
        { name: "Access-Control-Allow-Headers", value: "authorization,apikey,x-client-info,content-type,x-supabase-api-version" },
      ] });
      return;
    }
    if (request.method === "PUT" && request.url.includes("/auth/v1/user")) passwordUpdateSent = true;
    void send("Fetch.fulfillRequest", {
      requestId: message.params.requestId, responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Access-Control-Allow-Origin", value: base },
        { name: "Access-Control-Allow-Methods", value: "GET,PUT,OPTIONS" },
        { name: "Access-Control-Allow-Headers", value: "authorization,apikey,x-client-info,content-type,x-supabase-api-version" },
      ],
      body: Buffer.from(JSON.stringify(simulatedUser)).toString("base64"),
    });
    return;
  }
  if (!message.id) return;
  const item = pending.get(message.id);
  if (!item) return;
  pending.delete(message.id);
  clearTimeout(item.timer);
  if (message.error) item.reject(new Error(message.error.message)); else item.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const command = ++id;
  const timer = setTimeout(() => { pending.delete(command); reject(new Error(`Browser command timed out: ${method}`)); }, 10000);
  pending.set(command, { resolve, reject, timer }); ws.send(JSON.stringify({ id: command, method, params }));
});
ws.onclose = () => { for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("Browser disconnected")); } pending.clear(); };
const evaluate = async expression => {
  const value = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails));
  return value.result.value;
};
const waitFor = async expression => {
  const until = Date.now() + 15000;
  while (Date.now() < until) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const page = await evaluate("({ url: location.href, text: document.body?.innerText?.slice(0, 800), flow: sessionStorage.getItem('max-auth-flow'), linkError: sessionStorage.getItem('max-auth-link-error') })");
  throw new Error(`Timed out: ${expression}; page=${JSON.stringify(page)}`);
};
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await evaluate("localStorage.clear(); sessionStorage.clear(); true");
  for (const route of ["/cars", "/signup", "/reset-password", "/auth/callback"]) {
    await send("Page.navigate", { url: base + route });
    await waitFor(`location.pathname === ${JSON.stringify(route)} && document.readyState !== 'loading'`);
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(await evaluate("location.pathname"), route, `${route} must remain public`);
    console.log(`PASS: ${route} stays public`);
  }
  await send("Page.navigate", { url: base + "/reset-password" });
  await waitFor("document.querySelector('form.authcard') && Object.keys(document.querySelector('form.authcard')).some(key => key.startsWith('__reactProps$'))");
  await evaluate(`(() => { const form = document.querySelector('form.authcard'); form.elements.password.value = 'Example-Password123'; form.elements.confirm.value = 'Example-Password123'; form.requestSubmit(); })()`);
  await waitFor("document.querySelector('[role=status]')?.textContent.includes('Open the reset link')");
  await send("Page.navigate", { url: base + "/login" });
  await waitFor("location.pathname === '/login'");
  await send("Page.navigate", { url: base + "/reset-password#error=access_denied&type=recovery" });
  await waitFor("document.querySelector('[role=status]')?.textContent.includes('invalid, expired, or already used')");
  assert.ok(await evaluate("document.querySelector('a[href=\"/forgot-password\"]') !== null"));
  await send("Page.navigate", { url: base + "/dashboard" });
  await waitFor("location.pathname === '/login'");
  assert.match(await evaluate("location.search"), /returnTo=/);
  console.log("PASS: public catalogue, signup, recovery and confirmation routes; expired recovery handling; protected dashboard redirect.");
  // Simulate only Supabase's identity response; no real invitation, account,
  // password update or email is created by this browser regression check.
  simulatedUser = { id: "10000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "browser-test@example.com", user_metadata: { name: "Browser Test" }, app_metadata: {}, created_at: new Date().toISOString() };
  await send("Fetch.enable", { patterns: [{ urlPattern: "*supabase.co/auth/v1/user*", requestStage: "Request" }, { urlPattern: "*supabase.co/auth/v1/logout*", requestStage: "Request" }] });
  const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: simulatedUser.id, aud: "authenticated", role: "authenticated", exp: now + 3600, iat: now })}.${encode("browser-test")}`;
  const fragment = new URLSearchParams({ access_token: token, refresh_token: "browser-test-refresh", token_type: "bearer", expires_in: "3600", expires_at: String(now + 3600), type: "invite" });
  await send("Page.navigate", { url: `${base}/#${fragment}` });
  await waitFor("location.pathname === '/reset-password' && document.querySelector('input[name=password]') !== null");
  await waitFor("Object.keys(document.querySelector('form.authcard')).some(key => key.startsWith('__reactProps$'))");
  console.log("PASS: simulated invitation landing on the homepage opens password setup.");
  await evaluate(`(() => { const form = document.querySelector('form.authcard'); form.elements.password.value = 'Another-Password123'; form.elements.confirm.value = 'Different-Password123'; form.requestSubmit(); })()`);
  await waitFor("document.querySelector('[role=status]')?.textContent.includes('Passwords do not match')");
  assert.equal(passwordUpdateSent, false, "mismatched passwords must not call Supabase");
  await evaluate(`(() => { const form = document.querySelector('form.authcard'); form.elements.confirm.value = 'Another-Password123'; form.requestSubmit(); })()`);
  await waitFor("location.pathname === '/login' && location.search.includes('passwordReset=1')");
  assert.equal(passwordUpdateSent, true, "Supabase must confirm the password update");
  assert.equal(signOutSent, true, "the recovery session must be signed out");
  await waitFor("document.querySelector('[role=status]')?.textContent.includes('Your password has been updated')");
  console.log("PASS: mismatch blocked; simulated password update signed out and returned to login.");
  fragment.set("type", "recovery");
  await send("Page.navigate", { url: `${base}/#${fragment}` });
  await waitFor("location.pathname === '/reset-password' && document.querySelector('input[name=password]') !== null");
  console.log("PASS: simulated recovery link opens password setup instead of the dashboard.");
} finally { ws.close(); }
