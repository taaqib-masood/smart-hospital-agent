import { existsSync } from "node:fs";

for (const envFile of [".env", ".env.local"]) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const required = demoMode
  ? []
  : ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

if (process.env.CHECK_SCHEDULER === "true") required.push("CRON_SECRET");

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing required configuration: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(demoMode ? "Configuration valid: demo mode." : "Configuration valid: live Supabase credentials present.");
