const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });
const { config } = require("./src/config");
const { createApp } = require("./src/app");

async function start() {
  const settings = config();
  await mongoose.connect(settings.mongoUri);
  console.log("MongoDB connected successfully");
  const server = createApp(settings).listen(settings.port, () => {
    console.log(`MAX CARS server running on port ${settings.port}`);
  });
  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
