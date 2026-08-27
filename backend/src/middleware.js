const { verifyToken } = require("./auth");
const { User } = require("./models");

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function authenticate(secret) {
  return asyncRoute(async (req, res, next) => {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
    let payload;
    try { payload = verifyToken(token, secret); }
    catch { return res.status(401).json({ success: false, message: "Invalid or expired session" }); }
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return res.status(401).json({ success: false, message: "Account unavailable" });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  next();
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: "API route not found" });
}

function errorHandler(error, req, res, next) {
  void next;
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "This record already exists" });
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }
  console.error("API error:", error.message);
  res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = { asyncRoute, authenticate, requireAdmin, notFound, errorHandler };
