const port = process.env.CHROME_DEBUG_PORT || "9223";
const preview = process.env.PREVIEW_URL || "http://127.0.0.1:5174";
const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json());
const target = targets.find(candidate => candidate.type === "page");
if (!target) throw new Error("Chrome debugging page was not found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
let commandId = 0;
const pending = new Map();
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = expression => send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
const waitFor = async (expression, timeout = 10000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await evaluate(expression);
    if (result.result.value) return result.result.value;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
};

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: `${preview}/signup?returnTo=/` });
try {
  await waitFor("document.querySelector('form.authcard') !== null");
} catch (error) {
  const diagnostic = await evaluate("({ url: location.href, title: document.title, text: document.body?.innerText?.slice(0, 1000) || '' })");
  throw new Error(`${error.message}\n${JSON.stringify(diagnostic.result.value)}`);
}
await waitFor("Object.keys(document.querySelector('form.authcard')).some(key => key.startsWith('__reactProps$'))");
const email = `browser-smoke-${Date.now()}@example.com`;
const formState = await evaluate(`(() => {
  const form = document.querySelector('form.authcard');
  const set = (name, value) => {
    const field = form.elements.namedItem(name);
    if (!field) throw new Error('Missing form field: ' + name);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set('name', 'Browser Smoke Test');
  set('phone', '9876543210');
  set('city', 'Hyderabad');
  set('email', ${JSON.stringify(email)});
  set('password', 'TestPass123!');
  set('confirm', 'TestPass123!');
  const checks = form.querySelectorAll('input[type=checkbox]');
  checks[checks.length - 1].checked = true;
  checks[checks.length - 1].dispatchEvent(new Event('change', { bubbles: true }));
  if (!form.checkValidity()) return { invalid: [...form.elements].filter(field => !field.checkValidity()).map(field => ({ name: field.name, value: field.value, message: field.validationMessage })) };
  const button = form.querySelector('button[type=submit], button:not([type])');
  button.click();
  return { submitted: true };
})()`);
const point = formState.result.value;
if (!point) throw new Error(`Form population failed: ${JSON.stringify(formState)}`);
if (point.invalid) throw new Error(`Test could not populate the form: ${JSON.stringify(point.invalid)}`);
try {
  await waitFor("location.pathname === '/' && localStorage.getItem('max-session') !== null", 8000);
} catch (error) {
  const diagnostic = await evaluate("(() => { const form=document.querySelector('form.authcard'); return { url: location.href, message: document.querySelector('.form-message')?.textContent || '', users: localStorage.getItem('max-local-users'), session: localStorage.getItem('max-session'), valid: form?.checkValidity(), invalid: [...(form?.elements || [])].filter(field => !field.checkValidity()).map(field => ({name:field.name,type:field.type,value:field.value,message:field.validationMessage})), reactKeys: Object.keys(form || {}).filter(key => key.includes('react')) }; })()");
  throw new Error(`${error.message}\n${JSON.stringify(diagnostic.result.value)}`);
}
const outcome = await evaluate(`({
  path: location.pathname,
  session: JSON.parse(localStorage.getItem('max-session')),
  tokenPresent: Boolean(localStorage.getItem('max-auth-token'))
})`);
await evaluate("localStorage.removeItem('max-session'); localStorage.removeItem('max-auth-token'); true");
await send("Page.navigate", { url: `${preview}/login?returnTo=/dashboard` });
await waitFor("document.querySelector('form.authcard') !== null && Object.keys(document.querySelector('form.authcard')).some(key => key.startsWith('__reactProps$'))");
await evaluate(`(() => {
  const form = document.querySelector('form.authcard');
  const emailField = form.elements.namedItem('email');
  const passwordField = form.elements.namedItem('password');
  emailField.value = ${JSON.stringify(email)};
  passwordField.value = 'TestPass123!';
  emailField.dispatchEvent(new Event('input', { bubbles: true }));
  passwordField.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector('button[type=submit], button:not([type])').click();
  return true;
})()`);
await waitFor("location.pathname === '/dashboard' && localStorage.getItem('max-session') !== null", 8000);
const loginOutcome = await evaluate(`({
  path: location.pathname,
  session: JSON.parse(localStorage.getItem('max-session')),
  tokenPresent: Boolean(localStorage.getItem('max-auth-token'))
})`);
console.log(JSON.stringify({ signup: outcome.result.value, login: loginOutcome.result.value }, null, 2));
socket.close();
