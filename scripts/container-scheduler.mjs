const baseUrl = (process.env.APP_INTERNAL_URL || "http://app:3000").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!secret) throw new Error("CRON_SECRET is required when the scheduler profile is enabled");

async function call(path) {
  try {
    const response = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
    if (!response.ok) console.error(`${path} failed with ${response.status}: ${await response.text()}`);
  } catch (error) {
    console.error(`${path} could not be reached`, error);
  }
}

await Promise.all([call("/api/jobs/process"), call("/api/reminders")]);
setInterval(() => { void call("/api/jobs/process"); }, 5 * 60_000);
setInterval(() => { void call("/api/reminders"); }, 30 * 60_000);
