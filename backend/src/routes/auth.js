const express = require("express");
const { hashPassword, verifyPassword, signToken } = require("../auth");
const { User } = require("../models");
const { asyncRoute } = require("../middleware");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role });

module.exports = function authRoutes(secret, authenticate) {
  const router = express.Router();

  router.post("/register", asyncRoute(async (req, res) => {
    const { name, email, password, phone = "", city = "" } = req.body || {};
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (normalizedName.length < 2) return res.status(400).json({ success: false, message: "Enter your full name" });
    if (!emailPattern.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
    if (String(password || "").length < 8) return res.status(400).json({ success: false, message: "Password must contain at least 8 characters" });
    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Enter a valid 10-digit Indian mobile number" });
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "An account with this email already exists" });
    const user = await User.create({ name: normalizedName, email: normalizedEmail, phone: normalizedPhone, city, passwordHash: await hashPassword(String(password)) });
    res.status(201).json({ success: true, token: signToken(user, secret), user: publicUser(user) });
  }));

  router.post("/login", asyncRoute(async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
    if (String(req.body?.password || "").length < 8) return res.status(400).json({ success: false, message: "Enter your password of at least 8 characters" });
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.active || !(await verifyPassword(String(req.body?.password || ""), user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    res.json({ success: true, token: signToken(user, secret), user: publicUser(user) });
  }));

  router.get("/me", authenticate, (req, res) => res.json({ success: true, user: publicUser(req.user) }));
  router.patch("/me", authenticate, asyncRoute(async (req, res) => {
    for (const key of ["name", "phone", "city"]) if (req.body?.[key] !== undefined) req.user[key] = String(req.body[key]).trim();
    await req.user.save();
    res.json({ success: true, user: publicUser(req.user) });
  }));

  router.post("/forgot-password", (req, res) => {
    void req;
    res.json({ success: true, message: "If the account exists, recovery instructions will be sent when email delivery is configured" });
  });

  return router;
};
