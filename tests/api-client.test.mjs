import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "../app/api-client.ts";

test("network failures never create a local account or session", async () => {
  const originalFetch = globalThis.fetch;
  const writes = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.localStorage = { getItem: () => null, setItem: (...args) => writes.push(args) };
  globalThis.fetch = async () => { throw new TypeError("Network unavailable"); };
  try {
    for (const path of ["/api/auth/register", "/api/auth/login", "/api/auth/forgot-password"]) {
      await assert.rejects(apiRequest(path, { method: "POST", body: JSON.stringify({ email: "test@example.com", password: "test-password" }) }), /Unable to reach MAX CARS/);
    }
    assert.deepEqual(writes, []);
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});
