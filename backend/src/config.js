const required = ["MONGODB_URI", "AUTH_SECRET"];

function config() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    authSecret: process.env.AUTH_SECRET,
    clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:5173")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

module.exports = { config };
