const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });
const { User, Favourite, Booking, Order, Listing, SupportTicket } = require("../src/models");

const baseUrl = (process.env.SMOKE_BASE_URL || "https://maxcarx.netlify.app").replace(/\/$/, "");
const stamp = Date.now();
const email = `maxcars-smoke-${stamp}@example.com`;
const password = `Smoke-${stamp}-Safe!`;
let userId;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: ${response.status} ${payload.message || ""}`);
  return { status: response.status, payload };
}

async function run() {
  const checks = [];
  const health = await request("/api/health");
  checks.push(["health", health.status]);
  const registered = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "MAX CARS Smoke Test", email, password, phone: "9999999999", city: "Hyderabad" }),
  });
  userId = registered.payload.user.id;
  let token = registered.payload.token;
  checks.push(["register", registered.status]);
  const login = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  token = login.payload.token;
  checks.push(["login", login.status]);
  const headers = { authorization: `Bearer ${token}` };
  checks.push(["session", (await request("/api/auth/me", { headers })).status]);
  checks.push(["favourite", (await request("/api/favourites", { method: "POST", headers, body: JSON.stringify({ vehicleId: "mc-001" }) })).status]);
  checks.push(["booking", (await request("/api/bookings", { method: "POST", headers, body: JSON.stringify({ vehicleId: "mc-001", location: "Hyderabad", appointmentAt: new Date(Date.now() + 86400000).toISOString() }) })).status]);
  checks.push(["listing", (await request("/api/listings", { method: "POST", headers, body: JSON.stringify({ registration: "TS09ZZ9999", brand: "BMW", model: "M2" }) })).status]);
  checks.push(["order", (await request("/api/orders", { method: "POST", headers, body: JSON.stringify({ items: [{ vehicleId: "mc-001", quantity: 1 }], customer: { email }, fulfilment: { location: "Hyderabad" } }) })).status]);
  checks.push(["support", (await request("/api/support", { method: "POST", headers, body: JSON.stringify({ topic: "Technical Problems", subject: "Automated production smoke test", description: "This temporary record verifies the deployed support-ticket workflow." }) })).status]);
  const adminResponse = await fetch(`${baseUrl}/api/admin/summary`, { headers });
  if (adminResponse.status !== 403) throw new Error(`Admin authorization expected 403, received ${adminResponse.status}`);
  checks.push(["admin-denied", adminResponse.status]);
  console.log(JSON.stringify({ success: true, baseUrl, checks }, null, 2));
}

async function cleanup() {
  if (!process.env.MONGODB_URI) return;
  await mongoose.connect(process.env.MONGODB_URI);
  const user = userId ? await User.findById(userId) : await User.findOne({ email });
  if (user) {
    await Promise.all([Favourite, Booking, Order, Listing, SupportTicket].map((Model) => Model.deleteMany({ user: user._id })));
    await User.deleteOne({ _id: user._id });
  }
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => cleanup().catch((error) => {
  console.error(`Cleanup failed: ${error.message}`);
  process.exitCode = 1;
}));
