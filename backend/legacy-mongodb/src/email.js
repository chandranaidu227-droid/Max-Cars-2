const nodemailer = require("nodemailer");
const { buildPasswordResetEmail } = require("./auth");

function publicBaseUrl() {
  const value = process.env.PUBLIC_BASE_URL || process.env.URL;
  if (!value) throw new Error("PUBLIC_BASE_URL is required for password recovery");
  const url = new URL(value);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("Password recovery requires an HTTPS public URL");
  }
  return url.origin;
}

function emailConfigured() {
  try {
    publicBaseUrl();
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  } catch { return false; }
}

function createTransporter() {
  if (!emailConfigured()) throw new Error("SMTP and PUBLIC_BASE_URL must be configured");
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendPasswordResetEmail(email, user, token) {
  const resetUrl = `${publicBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const message = buildPasswordResetEmail({ name: user.name || "there", email, resetUrl });
  const result = await createTransporter().sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, ...message });
  if (!result.accepted?.length || result.rejected?.length) throw new Error("SMTP did not accept the recovery email");
}

module.exports = { emailConfigured, createTransporter, sendPasswordResetEmail };
