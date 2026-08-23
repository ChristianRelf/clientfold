import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runAutomaticReminderJob } from "@/lib/automatic-reminders";

export const dynamic = "force-dynamic";

function authorised(request: Request): boolean {
  const secret = process.env.REMINDER_JOB_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !supplied) return false;
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: Request) {
  if (!authorised(request)) return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  if (process.env.AUTOMATIC_REMINDERS_ENABLED !== "true") return NextResponse.json({ ok: true, disabled: true, scanned: 0, sent: 0, skipped: 0, failed: 0 });
  const limit = Number(process.env.AUTOMATIC_REMINDER_BATCH_SIZE ?? 50);
  const result = await runAutomaticReminderJob(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({ ok: true, ...result });
}
