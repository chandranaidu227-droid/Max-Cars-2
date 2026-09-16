const express = require("express");
const { asyncRoute } = require("../middleware");
const { result, publicUser } = require("../supabase");
module.exports = function authRoutes(settings, protect) {
  const router = express.Router();
  router.post("/register", asyncRoute(async (req, res) => {
    const { email, password, name, phone = "", city = "" } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || typeof password !== "string" || password.length < 8) return res.status(400).json({ success: false, message: "Enter your name and a password of at least 8 characters" });
    const { data, error } = await req.supabase.auth.signUp({ email, password, options: { data: { name: name.trim(), phone, city }, emailRedirectTo: `${settings.publicBaseUrl}/auth/callback` } });
    if (error) throw error;
    res.status(201).json({ success: true, token: data.session?.access_token, refreshToken: data.session?.refresh_token, user: data.user ? publicUser(data.user) : null, confirmationRequired: !data.session, message: "Check your email to confirm your account before logging in." });
  }));
  router.post("/login", asyncRoute(async (req, res) => {
    const { data, error } = await req.supabase.auth.signInWithPassword({ email: req.body?.email, password: req.body?.password });
    if (error) {
      if (error.status === 400 || error.status === 401) return res.status(401).json({ success: false, message: "Invalid credentials or email confirmation is required" });
      throw error;
    }
    res.json({ success: true, token: data.session.access_token, refreshToken: data.session.refresh_token, user: publicUser(data.user) });
  }));
  router.post("/forgot-password", asyncRoute(async (req, res) => {
    const { error } = await req.supabase.auth.resetPasswordForEmail(req.body?.email, { redirectTo: `${settings.publicBaseUrl}/reset-password` });
    if (error) throw error;
    res.json({ success: true, message: "If the account exists, recovery instructions will be sent." });
  }));
  router.post("/reset-password", protect, asyncRoute(async (req, res) => {
    if (typeof req.body?.password !== "string" || req.body.password.length < 8) return res.status(400).json({ success: false, message: "Use at least 8 characters" });
    const response = await fetch(`${settings.supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: settings.supabaseKey, Authorization: req.get("authorization"), "Content-Type": "application/json" },
      body: JSON.stringify({ password: req.body.password }), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return res.status(response.status).json({ success: false, message: "Unable to update password. Request a new recovery link or try another password." });
    res.json({ success: true, message: "Password updated. Log in with your new password." });
  }));
  router.get("/me", protect, asyncRoute(async (req, res) => {
    const profile = await result(req.supabase.from("profiles").select("*").eq("id", req.user.id).single());
    res.json({ success: true, user: { ...publicUser(req.user), ...profile } });
  }));
  router.patch("/me", protect, asyncRoute(async (req, res) => {
    const values = Object.fromEntries(["name", "phone", "city"].filter(key => req.body?.[key] !== undefined).map(key => [key, String(req.body[key]).trim()]));
    const user = await result(req.supabase.from("profiles").update(values).eq("id", req.user.id).select().single());
    res.json({ success: true, user });
  }));
  return router;
};
