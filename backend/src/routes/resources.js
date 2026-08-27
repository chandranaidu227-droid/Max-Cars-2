const express = require("express");
const crypto = require("crypto");
const { Favourite, Booking, Order, Listing, SupportTicket, Vehicle } = require("../models");
const { asyncRoute, requireAdmin } = require("../middleware");

function ownerCrud(Model, createFields, updateFields = []) {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await Model.find({ user: req.user._id }).sort({ createdAt: -1 }) })));
  router.post("/", asyncRoute(async (req, res) => {
    const values = Object.fromEntries(createFields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    const missing = createFields.filter((key) => values[key] === undefined);
    if (missing.length) return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(", ")}` });
    const record = await Model.create({ ...values, user: req.user._id });
    res.status(201).json({ success: true, record });
  }));
  router.patch("/:id", asyncRoute(async (req, res) => {
    const values = Object.fromEntries(updateFields.filter((key) => req.body?.[key] !== undefined).map((key) => [key, req.body[key]]));
    const record = await Model.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, values, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, record });
  }));
  router.delete("/:id", asyncRoute(async (req, res) => {
    const record = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.status(204).end();
  }));
  return router;
}

function favouriteRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await Favourite.find({ user: req.user._id }).sort({ createdAt: -1 }) })));
  router.post("/", asyncRoute(async (req, res) => {
    if (!req.body?.vehicleId) return res.status(400).json({ success: false, message: "vehicleId is required" });
    const record = await Favourite.findOneAndUpdate({ user: req.user._id, vehicleId: req.body.vehicleId }, { $setOnInsert: { user: req.user._id, vehicleId: req.body.vehicleId } }, { new: true, upsert: true });
    res.status(201).json({ success: true, record });
  }));
  router.delete("/:vehicleId", asyncRoute(async (req, res) => {
    await Favourite.deleteOne({ user: req.user._id, vehicleId: req.params.vehicleId });
    res.status(204).end();
  }));
  return router;
}

function orderRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) })));
  router.get("/:reference", asyncRoute(async (req, res) => {
    const record = await Order.findOne({ user: req.user._id, reference: req.params.reference });
    if (!record) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, record });
  }));
  router.post("/", asyncRoute(async (req, res) => {
    const { items, customer = {}, fulfilment = {} } = req.body || {};
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: "At least one order item is required" });
    const reference = `MAX-ORD-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const record = await Order.create({ user: req.user._id, reference, items, customer, fulfilment });
    res.status(201).json({ success: true, record });
  }));
  return router;
}

function supportRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => res.json({ success: true, records: await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 }) })));
  router.post("/", asyncRoute(async (req, res) => {
    const { topic, subject, description, vehicleId } = req.body || {};
    if (!topic || !subject || String(description).length < 20) return res.status(400).json({ success: false, message: "Topic, subject and a detailed description are required" });
    const reference = `MAX-SUP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const record = await SupportTicket.create({ user: req.user._id, reference, topic, subject, description, vehicleId });
    res.status(201).json({ success: true, record });
  }));
  return router;
}

function vehicleRoutes() {
  const router = express.Router();
  router.get("/", asyncRoute(async (req, res) => {
    const query = { active: true };
    if (req.query.brand) query.brand = req.query.brand;
    if (req.query.fuel) query.fuel = req.query.fuel;
    res.json({ success: true, records: await Vehicle.find(query).sort({ brand: 1, model: 1 }) });
  }));
  router.get("/:slug", asyncRoute(async (req, res) => {
    const record = await Vehicle.findOne({ slug: req.params.slug, active: true });
    if (!record) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, record });
  }));
  return router;
}

function adminRoutes() {
  const router = express.Router();
  router.use(requireAdmin);
  router.get("/summary", asyncRoute(async (req, res) => {
    const [users, vehicles, bookings, orders, listings, tickets] = await Promise.all([
      require("../models").User.countDocuments(), Vehicle.countDocuments(), Booking.countDocuments(), Order.countDocuments(), Listing.countDocuments(), SupportTicket.countDocuments(),
    ]);
    res.json({ success: true, summary: { users, vehicles, bookings, orders, listings, tickets } });
  }));
  router.post("/vehicles", asyncRoute(async (req, res) => res.status(201).json({ success: true, record: await Vehicle.create(req.body) })));
  router.patch("/vehicles/:id", asyncRoute(async (req, res) => {
    const record = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, record });
  }));
  return router;
}

module.exports = {
  favouriteRoutes,
  bookingRoutes: () => ownerCrud(Booking, ["vehicleId", "location", "appointmentAt"], ["status", "notes", "appointmentAt"]),
  orderRoutes,
  listingRoutes: () => ownerCrud(Listing, ["registration", "brand", "model"], ["year", "price", "details", "status"]),
  supportRoutes,
  vehicleRoutes,
  adminRoutes,
};
