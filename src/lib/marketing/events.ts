import { db } from "@/lib/db";
import { dispatchAdConversions } from "@/lib/marketing/conversions";
import { dispatchWebhookEvent } from "@/lib/integrations/webhooks";

/**
 * Consistent marketing event taxonomy. Events power the funnel, activation
 * metric and growth dashboard. Metadata is sanitised: never filenames, client
 * names, invoice descriptions or message content — only opaque ids and safe
 * descriptors (plan keys, counts, campaign keys).
 */

export const MARKETING_EVENTS = [
  "marketing.page_view",
  "marketing.cta_clicked",
  "marketing.hero_demo_started",
  "marketing.hero_demo_completed",
  "marketing.demo_started",
  "marketing.demo_completed",
  "waitlist.started",
  "marketing.pricing_viewed",
  "waitlist.joined",
  "auth.signup_started",
  "auth.signup_completed",
  "onboarding.organisation_created",
  "onboarding.project_created",
  "client.invited",
  "client.invitation_opened",
  "client.action_completed",
  "approval.created",
  "approval.sent",
  "approval.approved",
  "invoice.created",
  "invoice.sent",
  "invoice.paid",
  "waiting.item_created",
  "waiting.item_resolved",
  "reminder.automatic_sent",
  "reminder.automatic_failed",
  "subscription.checkout_started",
  "subscription.started",
  "subscription.upgraded",
  "subscription.cancelled",
] as const;

export type MarketingEventName = (typeof MARKETING_EVENTS)[number];

// Keys we allow through to advertising networks / analytics. Anything not on
// this list is dropped before leaving our servers.
const SAFE_METADATA_KEYS = new Set([
  "plan",
  "fromPlan",
  "toPlan",
  "campaign",
  "source",
  "medium",
  "variant",
  "experiment",
  "count",
  "type",
  "channel",
  "value",
  "currency",
  "workType",
  "placement",
  "page",
]);

export function sanitiseMetadata(input?: Record<string, unknown>): string | undefined {
  if (!input) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (SAFE_METADATA_KEYS.has(k) && (typeof v === "string" || typeof v === "number")) {
      out[k] = v;
    }
  }
  return Object.keys(out).length ? JSON.stringify(out) : undefined;
}

export type TrackContext = {
  visitorId?: string;
  userId?: string;
  organisationId?: string;
  sessionId?: string;
  campaign?: string;
  source?: string;
  medium?: string;
  landingPage?: string;
  path?: string;
};

/** Persist a marketing event. Safe to call from server actions / route handlers. */
export async function trackEvent(
  name: MarketingEventName,
  ctx: TrackContext = {},
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const safeMetadata = sanitiseMetadata(metadata);
    const event = await db.marketingEvent.create({
      data: {
        name,
        visitorId: ctx.visitorId,
        userId: ctx.userId,
        organisationId: ctx.organisationId,
        sessionId: ctx.sessionId,
        campaign: ctx.campaign,
        source: ctx.source,
        medium: ctx.medium,
        landingPage: ctx.landingPage,
        path: ctx.path,
        metadata: safeMetadata,
      },
    });
    await Promise.all([
      dispatchAdConversions({ eventId: event.id, name, visitorId: ctx.visitorId, userId: ctx.userId, organisationId: ctx.organisationId, path: ctx.path, metadata, occurredAt: event.createdAt }),
      dispatchWebhookEvent({ eventId: event.id, type: name, organisationId: ctx.organisationId, occurredAt: event.createdAt, data: safeMetadata ? JSON.parse(safeMetadata) as Record<string, unknown> : {} }),
    ]);
  } catch {
    // Analytics must never break a user-facing flow.
  }
}
