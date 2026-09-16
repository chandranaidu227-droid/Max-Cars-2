const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, verifyPassword, signToken, verifyToken } = require("../src/auth");

test("passwords are salted and verified", async () => {
  const first = await hashPassword("correct-horse-battery-staple");
  const second = await hashPassword("correct-horse-battery-staple");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("correct-horse-battery-staple", first), true);
  assert.equal(await verifyPassword("incorrect", first), false);
});

test("signed sessions reject tampering", () => {
  const secret = "test-secret-that-is-long-enough-for-tests";
  const token = signToken({ _id: "507f1f77bcf86cd799439011", role: "customer" }, secret, 60);
  assert.equal(verifyToken(token, secret).sub, "507f1f77bcf86cd799439011");
  assert.throws(() => verifyToken(`${token}x`, secret));
});
