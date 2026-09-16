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
    version: user.sessionVersion || 0,
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

function createResetToken(expiresInMinutes = 30) {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + expiresInMinutes * 60000) };
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function buildPasswordResetEmail({ name, email, resetUrl }) {
  const subject = "Reset your MAX CARS password";
  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your MAX CARS password.",
    "Use the link below to create a new password:",
    "",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "Regards,",
    "MAX CARS Team",
  ].join("\n");
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;">
      <h2 style="margin-bottom:12px;">Reset your MAX CARS password</h2>
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your MAX CARS password.</p>
      <p><a href="${safeUrl}" style="color:#d11a2a;">Reset your password</a></p>
      <p>If the link does not work, copy and paste this into your browser:<br><span style="word-break:break-all;">${safeUrl}</span></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>Regards,<br>MAX CARS Team</p>
    </div>
  `;
  return { to: email, subject, text, html };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  createResetToken,
  hashResetToken,
  buildPasswordResetEmail,
};
