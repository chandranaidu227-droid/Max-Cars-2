const express = require("express");
const cors = require("cors");
const { authenticate, notFound, errorHandler } = require("./middleware");
const authRoutes = require("./routes/auth");
const resources = require("./routes/resources");

function createApp(settings) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({
    origin(origin, callback) {
      if (!origin || settings.clientOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Origin not allowed"));
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }));
  // serverless-http exposes the raw Netlify request body as a Buffer. Express
  // 5 treats an existing req.body as already parsed, so normalize JSON first.
  app.use((req, res, next) => {
    if (Buffer.isBuffer(req.body) && req.is("application/json")) {
      try {
        req.body = JSON.parse(req.body.toString("utf8") || "{}");
      } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON request body" });
      }
    }
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.get("/", (req, res) => res.send("MAX CARS Backend is running!"));
  app.get("/api/health", (req, res) => res.json({ success: true, message: "MAX CARS API connected successfully" }));
  const protect = authenticate(settings.authSecret);
  app.use("/api/auth", authRoutes(settings.authSecret, protect));
  app.use("/api/vehicles", resources.vehicleRoutes());
  app.use("/api/favourites", protect, resources.favouriteRoutes());
  app.use("/api/bookings", protect, resources.bookingRoutes());
  app.use("/api/orders", protect, resources.orderRoutes());
  app.use("/api/listings", protect, resources.listingRoutes());
  app.use("/api/support", protect, resources.supportRoutes());
  app.use("/api/admin", protect, resources.adminRoutes());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
