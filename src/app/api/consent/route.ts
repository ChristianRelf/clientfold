import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getVisitorId } from "@/lib/marketing/attribution";

const schema = z.object({
  analytics: z.boolean(),
  advertising: z.boolean(),
  region: z.string().optional(),
});

/** Persist consent choices and mirror them into readable cookies for gating. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });

  const visitorId = await getVisitorId();
  const { analytics, advertising, region } = parsed.data;

  if (visitorId) {
    try {
      await db.consent.upsert({
        where: { visitorId },
        create: { visitorId, analytics, advertising, region, essential: true },
        update: { analytics, advertising, region },
      });
    } catch {
      /* noop */
    }
  }

  const res = NextResponse.json({ ok: true });
  const opts = { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "lax" as const };
  res.cookies.set("cf_consent_analytics", analytics ? "1" : "0", opts);
  res.cookies.set("cf_consent_advertising", advertising ? "1" : "0", opts);
  res.cookies.set("cf_consent_set", "1", opts);
  if (!analytics) res.cookies.set("cf_attrib", "", { ...opts, maxAge: 0 });
  return res;
}
