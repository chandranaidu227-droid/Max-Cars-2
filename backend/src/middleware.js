const { result } = require("./supabase");
function asyncRoute(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }
function authenticate() {
  return asyncRoute(async (req, res, next) => {
    const token = req.get("authorization")?.replace(/^Bearer /, "");
    if (!token || !req.get("authorization")?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required" });
    const { data, error } = await req.supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ success: false, message: "Invalid or expired session" });
    req.user = data.user;
    next();
  });
}
const requireAdmin = asyncRoute(async (req, res, next) => {
  const profile = await result(req.supabase.from("profiles").select("role").eq("id", req.user.id).maybeSingle());
  if (profile?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  next();
});
function notFound(req, res) { res.status(404).json({ success: false, message: "API route not found" }); }
function errorHandler(error, req, res, next) {
  void next;
  const status = error.code === "23505" ? 409 : error.code === "42501" ? 403 : ["23514", "23502", "22P02", "22007", "PGRST102"].includes(error.code) ? 400 : error.status >= 400 && error.status < 500 ? error.status : 503;
  const message = status === 409 ? "This record already exists" : status === 403 ? "Access denied" : status === 400 || status === 422 ? "Invalid request data" : status === 401 ? "Invalid or expired session" : status === 429 ? "Too many requests. Please wait before trying again." : status === 413 ? "Request body is too large" : "The service is temporarily unavailable. Please try again later.";
  console.error("API error:", error.code || error.name || "unknown");
  res.status(status).json({ success: false, message });
}
module.exports = { asyncRoute, authenticate, requireAdmin, notFound, errorHandler };
