// Real MongoDB + HTTP workflow test. SMTP is captured; no email is sent.
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });
const nodemailer = require("nodemailer");
const { User, Favourite, Booking, Order, Listing, SupportTicket } = require("../src/models");
const { createResetToken } = require("../src/auth");
const { config } = require("../src/config");
const { createApp } = require("../src/app");

const email = `maxcars-integration-${Date.now()}@example.com`;
const testDatabase = `mc_verify_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
let server;
let sent;
const originalTransport = nodemailer.createTransport;
nodemailer.createTransport = () => ({ sendMail: async message => { sent = message; return { accepted: [message.to], rejected: [] }; } });
Object.assign(process.env, { SMTP_HOST: "smtp.test.invalid", SMTP_USER: "test", SMTP_PASS: "test", PUBLIC_BASE_URL: "https://maxcarx.netlify.app" });

async function run() {
  // Always override the URI's database. Never touch existing application data.
  await mongoose.connect(process.env.MONGODB_URI, { dbName: testDatabase, serverSelectionTimeoutMS: 15000 });
  assert.equal(mongoose.connection.name, testDatabase);
  console.log(`Isolated database: ${testDatabase}`);
  server = createApp(config()).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = "GET", body, token, status = 200) {
    const response = await fetch(`${base}/api${path}`, {
      method, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
    });
    const payload = await response.json().catch(() => ({}));
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(payload)}`);
    return payload;
  }
  const password = "Initial-Test-Password-123!";
  const registered = await request("/auth/register", "POST", { name: "Integration Test", email, password }, null, 201);
  const token = registered.token;
  await request("/auth/login", "POST", { email, password });
  await request("/auth/login", "POST", { email, password: "Incorrect-Password" }, null, 401);
  await request("/auth/me", "GET", null, token);
  await request("/admin/summary", "GET", null, token, 403);
  const resources = {
    favourites: { vehicleId: "mc-001" },
    bookings: { vehicleId: "mc-001", location: "Hyderabad", appointmentAt: new Date(Date.now() + 86400000).toISOString() },
    orders: { items: [{ vehicleId: "mc-001", quantity: 1 }], customer: { email }, fulfilment: { location: "Hyderabad" } },
    listings: { registration: "TS09ZZ9999", brand: "BMW", model: "M2", year: 2025, price: 100000, details: {} },
    support: { topic: "Testing", subject: "Temporary test", description: "Temporary automated integration test record." },
  };
  for (const [name, body] of Object.entries(resources)) {
    await request(`/${name}`, "POST", body, token, 201);
    const result = await request(`/${name}`, "GET", null, token);
    assert.equal(result.records.length, 1, `${name} persisted`);
  }
  await request("/auth/reset-password", "POST", { token: "malformed", password }, null, 400);
  await request("/auth/forgot-password", "POST", { email });
  assert.equal(sent.to, email);
  const resetToken = new URL(sent.text.match(/https:\/\/\S+/)[0]).searchParams.get("token");
  await request("/auth/reset-password", "POST", { token: "0".repeat(64), password }, null, 400);
  const newPassword = "Changed-Test-Password-123!";
  await request("/auth/reset-password", "POST", { token: resetToken, password: newPassword });
  await request("/auth/reset-password", "POST", { token: resetToken, password }, null, 400);
  await request("/auth/login", "POST", { email, password }, null, 401);
  await request("/auth/login", "POST", { email, password: newPassword });
  await request("/auth/me", "GET", null, token, 401);
  const expired = createResetToken(-1);
  await User.updateOne({ email }, { resetTokenHash: expired.tokenHash, resetTokenExpiresAt: expired.expiresAt });
  await request("/auth/reset-password", "POST", { token: expired.token, password }, null, 400);
  delete process.env.SMTP_PASS;
  await request("/auth/forgot-password", "POST", { email }, null, 503);
  console.log("PASS: MongoDB signup/login, wrong password, profile, authorization, five resource create/read workflows, captured recovery email, reset, replay rejection, expired/forged tokens, old session invalidation, and missing SMTP.");
}

run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (user) {
        await Promise.all([Favourite, Booking, Order, Listing, SupportTicket].map(Model => Model.deleteMany({ user: user._id })));
        await User.deleteOne({ _id: user._id });
      }
    }
  } catch (error) {
    console.error(`Temporary record cleanup failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
    nodemailer.createTransport = originalTransport;
  }
});
