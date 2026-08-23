const endpoint = process.env.REMINDER_WORKER_URL ?? "http://clientfold:3000/api/internal/reminders/run";
const secret = process.env.REMINDER_JOB_SECRET;
const interval = Number(process.env.REMINDER_POLL_INTERVAL_MS ?? 900000);

if (!secret) {
  console.error("REMINDER_JOB_SECRET is required for the reminder worker.");
  process.exit(1);
}

async function tick() {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
    const result = await response.text();
    console.log(new Date().toISOString(), response.status, result);
  } catch (error) {
    console.error(new Date().toISOString(), error instanceof Error ? error.message : error);
  }
}

await new Promise((resolve) => setTimeout(resolve, 5000));
await tick();
setInterval(tick, Number.isFinite(interval) && interval >= 60000 ? interval : 900000);
