require("dotenv").config({ quiet: true });
const { config } = require("./src/config");
const { createApp } = require("./src/app");
try {
  const settings = config();
  const server = createApp(settings).listen(settings.port, () => console.log(`MAX CARS Supabase API listening on ${settings.port}`));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
} catch (error) { console.error("Backend startup failed:", error.message); process.exit(1); }
