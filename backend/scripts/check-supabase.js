require("dotenv").config({ quiet: true });
const { config } = require("../src/config");
const { clientFor } = require("../src/supabase");
async function run() {
  const client = clientFor(config());
  const { data, error } = await client.from("vehicles").select("id,slug").limit(100);
  if (error) { console.error(`Supabase schema check failed: ${error.code}. Run supabase/setup.sql if the tables are missing.`); process.exitCode = 1; return; }
  console.log(`Supabase connected. ${data.length} public vehicles found.`);
  const { data: privateRows, error: privateError } = await client.from("orders").select("id").limit(1);
  if (privateRows?.length || !privateError) throw new Error("Anonymous order access must be denied.");
  console.log("Anonymous access to orders is denied.");
}
run().catch(() => { console.error("Supabase verification failed."); process.exitCode = 1; });
