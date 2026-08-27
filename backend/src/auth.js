const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored).split(":");
  if (!salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function signToken(user, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
  const payload = encode(JSON.stringify({
    sub: String(user._id),
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }));
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token, secret) {
  const [payload, signature] = String(token).split(".");
  if (!payload || !signature) throw new Error("Invalid token");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error("Invalid token");
  }
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) throw new Error("Expired token");
  return decoded;
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
