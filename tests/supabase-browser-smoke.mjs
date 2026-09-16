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
ws.onmessage = event => {
  const message = JSON.parse(event.data);
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
  throw new Error(`Timed out: ${expression}`);
};
try {
  await send("Page.enable");
  await send("Runtime.enable");
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
  await waitFor("document.querySelector('[role=status]')?.textContent.includes('invalid or expired')");
  await send("Page.navigate", { url: base + "/dashboard" });
  await waitFor("location.pathname === '/login'");
  assert.match(await evaluate("location.search"), /returnTo=/);
  console.log("PASS: public catalogue, signup, recovery and confirmation routes; expired recovery handling; protected dashboard redirect.");
} finally { ws.close(); }
