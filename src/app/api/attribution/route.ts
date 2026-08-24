import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getVisitorId, recordTouch } from "@/lib/marketing/attribution";

const schema = z.object({
  utm_source: z.string().max(160).optional(), utm_medium: z.string().max(160).optional(), utm_campaign: z.string().max(160).optional(),
  utm_term: z.string().max(160).optional(), utm_content: z.string().max(160).optional(),
  gclid: z.string().max(300).optional(), fbclid: z.string().max(300).optional(), msclkid: z.string().max(300).optional(),
  landingPage: z.string().max(500).optional(), referrer: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  const jar = await cookies();
  const allowed = jar.get("cf_consent_analytics")?.value === "1" || jar.get("cf_consent_advertising")?.value === "1";
  const visitorId = await getVisitorId();
  if (allowed && visitorId) await recordTouch(visitorId, parsed.data, true);
  return NextResponse.json({ ok: true });
}
