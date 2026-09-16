import test from "node:test";
import assert from "node:assert/strict";
import { switchAccountCache } from "../app/account-cache.ts";

test("switching accounts isolates records and preserves old data in a local archive", () => {
  const values = new Map([["max-orders", '[{"id":"old-mongo-order"}]']]);
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    switchAccountCache("alice");
    assert.equal(values.has("max-orders"), false);
    assert.match(values.get("max-account-cache:legacy"), /old-mongo-order/);
    values.set("max-orders", '[{"id":"alice-order"}]');
    switchAccountCache("bob");
    assert.equal(values.has("max-orders"), false);
    switchAccountCache("alice");
    assert.match(values.get("max-orders"), /alice-order/);
    switchAccountCache(null);
    assert.equal(values.has("max-orders"), false);
    assert.equal(values.has("max-data-owner"), false);
  } finally { delete globalThis.localStorage; }
});
