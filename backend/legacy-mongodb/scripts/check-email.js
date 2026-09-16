require("dotenv").config({ quiet: true });
const { createTransporter } = require("../src/email");

async function run() {
  const transport = createTransporter();
  try {
    await transport.verify();
    console.log("SMTP connection, TLS, and authentication verified. Inbox delivery has not been tested.");
  } finally { transport.close(); }
}
run().catch(error => { console.error(`Email configuration check failed: ${error.code || "configuration"}`); process.exitCode = 1; });
