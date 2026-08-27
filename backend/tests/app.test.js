const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

const settings = {
  authSecret: "test-secret-that-is-long-enough-for-tests",
  clientOrigins: ["http://localhost:3000"],
};

test("health endpoint responds without exposing framework headers", async () => {
  const server = createApp(settings).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.deepEqual(await response.json(), { success: true, message: "MAX CARS API connected successfully" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("unknown API routes return JSON 404", async () => {
  const server = createApp(settings).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/missing`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).success, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
