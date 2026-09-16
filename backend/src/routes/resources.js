const express = require("express");
const { asyncRoute, requireAdmin } = require("../middleware");
const { result } = require("../supabase");
const fields = (body, keys) => Object.fromEntries(keys.filter(key => body?.[key] !== undefined).map(key => [key, body[key]]));
function ownedRoutes(table, required, optional = [], updates = [], canDelete = true) {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await result(req.supabase.from(table).select("*").eq("user", req.user.id).order("createdAt", { ascending: false })) })));
  router.post("/", asyncRoute(async (req, res) => {
    if (required.some(key => req.body?.[key] === undefined || req.body[key] === "")) return res.status(400).json({ success: false, message: `Required fields: ${required.join(", ")}` });
    const values = { ...fields(req.body, [...required, ...optional]), user: req.user.id };
    if (table === "orders" && (!Array.isArray(values.items) || !values.items.length)) return res.status(400).json({ success: false, message: "At least one order item is required" });
    const record = await result(req.supabase.from(table).insert(values).select().single());
    res.status(201).json({ success: true, record });
  }));
  if (updates.length) router.patch("/:id", asyncRoute(async (req, res) => {
    const values = fields(req.body, updates);
    if (!Object.keys(values).length) return res.status(400).json({ success: false, message: "No editable fields provided" });
    const record = await result(req.supabase.from(table).update(values).eq("id", req.params.id).eq("user", req.user.id).select().maybeSingle());
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, record });
  }));
  if (canDelete) router.delete("/:id", asyncRoute(async (req, res) => {
    const rows = await result(req.supabase.from(table).delete().eq("id", req.params.id).eq("user", req.user.id).select("id"));
    if (!rows.length) return res.status(404).json({ success: false, message: "Record not found" });
    res.status(204).end();
  }));
  return router;
}
function favouriteRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await result(req.supabase.from("favourites").select("*").eq("user", req.user.id).order("createdAt", { ascending: false })) })));
  router.post("/", asyncRoute(async (req, res) => {
    if (typeof req.body?.vehicleId !== "string" || !req.body.vehicleId.trim()) return res.status(400).json({ success: false, message: "vehicleId is required" });
    const values = { user: req.user.id, vehicleId: req.body.vehicleId };
    await result(req.supabase.from("favourites").upsert(values, { onConflict: "user,vehicleId", ignoreDuplicates: true }));
    const record = await result(req.supabase.from("favourites").select("*").eq("user", req.user.id).eq("vehicleId", values.vehicleId).single());
    res.status(201).json({ success: true, record });
  }));
  router.delete("/:vehicleId", asyncRoute(async (req, res) => {
    await result(req.supabase.from("favourites").delete().eq("user", req.user.id).eq("vehicleId", req.params.vehicleId));
    res.status(204).end();
  }));
  return router;
}
function orderRoutes() {
  const router = ownedRoutes("orders", ["items"], ["customer", "fulfilment"], [], false);
  router.get("/:reference", asyncRoute(async (req, res) => {
    const record = await result(req.supabase.from("orders").select("*").eq("user", req.user.id).eq("reference", req.params.reference).maybeSingle());
    if (!record) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, record });
  }));
  return router;
}
function vehicleRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => {
    let query = req.supabase.from("vehicles").select("*").eq("active", true);
    for (const key of ["brand", "fuel"]) if (typeof req.query[key] === "string") query = query.eq(key, req.query[key]);
    res.json({ success: true, records: await result(query.order("brand").order("model")) });
  }));
  router.get("/:slug", asyncRoute(async (req, res) => {
    const record = await result(req.supabase.from("vehicles").select("*").eq("active", true).eq("slug", req.params.slug).maybeSingle());
    if (!record) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, record });
  }));
  return router;
}
function adminRoutes() {
  const router = express.Router();
  router.use(requireAdmin);
  router.get("/summary", asyncRoute(async (req, res) => {
    const tables = { users: "profiles", vehicles: "vehicles", bookings: "bookings", orders: "orders", listings: "listings", tickets: "support_tickets" };
    const entries = await Promise.all(Object.entries(tables).map(async ([name, table]) => {
      const { count, error } = await req.supabase.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return [name, count];
    }));
    res.json({ success: true, summary: Object.fromEntries(entries) });
  }));
  const vehicleFields = ["catalogueId", "slug", "brand", "model", "variant", "price", "fuel", "body", "year", "image", "active", "metadata"];
  router.post("/vehicles", asyncRoute(async (req, res) => res.status(201).json({ success: true, record: await result(req.supabase.from("vehicles").insert(fields(req.body, vehicleFields)).select().single()) })));
  router.patch("/vehicles/:id", asyncRoute(async (req, res) => {
    const record = await result(req.supabase.from("vehicles").update(fields(req.body, vehicleFields)).eq("id", req.params.id).select().maybeSingle());
    if (!record) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, record });
  }));
  return router;
}
module.exports = {
  favouriteRoutes, orderRoutes, vehicleRoutes, adminRoutes,
  bookingRoutes: () => ownedRoutes("bookings", ["vehicleId", "location", "appointmentAt"], ["notes"], ["status", "notes", "appointmentAt"]),
  listingRoutes: () => ownedRoutes("listings", ["registration", "brand", "model"], ["year", "price", "details"], ["year", "price", "details", "status"]),
  supportRoutes: () => ownedRoutes("support_tickets", ["topic", "subject", "description"], ["vehicleId"], [], false),
};
