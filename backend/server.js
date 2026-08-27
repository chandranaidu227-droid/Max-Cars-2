const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MAX CARS Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MAX CARS API connected successfully",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `🚗 MAX CARS server running on port ${process.env.PORT || 5000}`,
      );
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });
