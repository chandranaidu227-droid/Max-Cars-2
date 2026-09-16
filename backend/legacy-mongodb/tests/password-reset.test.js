const test = require("node:test");
const assert = require("node:assert/strict");
const { createResetToken, hashResetToken, buildPasswordResetEmail } = require("../src/auth");

test("createResetToken returns a random token that expires in the future", () => {
  const reset = createResetToken();
  assert.equal(typeof reset.token, "string");
  assert.ok(reset.token.length > 32);
  assert.ok(reset.expiresAt instanceof Date);
  assert.ok(reset.expiresAt.getTime() > Date.now());
  assert.equal(hashResetToken(reset.token), reset.tokenHash);
  assert.notEqual(createResetToken().token, reset.token);
  assert.notEqual(reset.token, reset.tokenHash);
});

test("buildPasswordResetEmail includes a valid reset link", () => {
  const email = buildPasswordResetEmail({
    name: "Test User",
    email: "test@example.com",
    resetUrl: "https://maxcarx.netlify.app/reset-password?token=demo-token",
  });

  assert.equal(email.subject, "Reset your MAX CARS password");
  assert.match(email.text, /https:\/\/maxcarx\.netlify\.app\/reset-password\?token=demo-token/);
  assert.match(email.html, /https:\/\/maxcarx\.netlify\.app\/reset-password\?token=demo-token/);
});
