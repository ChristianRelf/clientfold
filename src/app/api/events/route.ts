import { NextResponse } from "next/server";
import { z } from "zod";
import { MARKETING_EVENTS, trackEvent, type MarketingEventName } from "@/lib/marketing/events";
import { getVisitorId } from "@/lib/marketing/attribution";

const schema = z.object({
  name: z.enum(MARKETING_EVENTS as unknown as [MarketingEventName, ...MarketingEventName[]]),
  path: z.string().optional(),
  campaign: z.string().optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  metadata: z.record(z.union([z.string(), z.number()])).optional(),
});

/**
 * First-party event ingestion. Client fires safe, taxonomy-constrained events.
 * We attach the server-known visitorId and drop any metadata key that isn't on
 * the allow-list - client content never reaches analytics.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });

  const visitorId = (await getVisitorId()) ?? undefined;

  await trackEvent(parsed.data.name, { visitorId, path: parsed.data.path, campaign: parsed.data.campaign, source: parsed.data.source, medium: parsed.data.medium }, parsed.data.metadata);
  return NextResponse.json({ ok: true });
}
