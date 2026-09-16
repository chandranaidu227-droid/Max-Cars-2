const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"];

function config() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return {
    port: Number(process.env.PORT) || 5000,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.URL || "http://localhost:3000",
    clientOrigins: [process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:5173", process.env.URL, process.env.DEPLOY_PRIME_URL]
      .filter(Boolean)
      .join(",")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

module.exports = { config };
