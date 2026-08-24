import { createHash } from "node:crypto";
import { db } from "@/lib/db";

const EVENT_NAMES: Record<string, { meta: string; google: string }> = {
  "waitlist.joined": { meta: "Lead", google: "generate_lead" },
  "auth.signup_completed": { meta: "CompleteRegistration", google: "sign_up" },
  "subscription.started": { meta: "Subscribe", google: "purchase" },
  "invoice.paid": { meta: "Purchase", google: "purchase" },
};

type ConversionInput = { eventId: string; name: string; visitorId?: string; userId?: string; organisationId?: string; path?: string; metadata?: Record<string, unknown>; occurredAt: Date };

const stringValue = (value: unknown) => typeof value === "string" && value ? value : undefined;
const numberValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const timeoutSignal = () => AbortSignal.timeout(5_000);

/** Consent-gated, best-effort server-side conversion delivery. */
export async function dispatchAdConversions(input: ConversionInput): Promise<void> {
  const mapping = EVENT_NAMES[input.name];
  if (!mapping) return;
  try {
    const attribution = input.visitorId
      ? await db.attribution.findUnique({ where: { visitorId: input.visitorId } })
      : await db.attribution.findFirst({
          where: input.userId ? { userId: input.userId } : input.organisationId ? { organisationId: input.organisationId } : { id: "" },
          orderBy: { lastTouchAt: "desc" },
        });
    if (!attribution) return;
    const consent = await db.consent.findUnique({ where: { visitorId: attribution.visitorId } });
    if (!consent?.advertising) return;

    const rawValue = numberValue(input.metadata?.value);
    const value = rawValue == null ? undefined : rawValue / 100;
    const currency = stringValue(input.metadata?.currency) ?? "GBP";
    const pageUrl = `${process.env.APP_URL ?? "http://localhost:3000"}${input.path ?? attribution.lastLandingPage ?? "/"}`;
    await Promise.allSettled([
      sendMeta({ eventId: input.eventId, eventName: mapping.meta, occurredAt: input.occurredAt, visitorId: attribution.visitorId, fbclid: attribution.fbclid, firstTouchAt: attribution.firstTouchAt, pageUrl, value, currency }),
      sendGoogle({ eventId: input.eventId, eventName: mapping.google, occurredAt: input.occurredAt, visitorId: attribution.visitorId, gclid: attribution.gclid, value, currency }),
      sendGeneric({ eventId: input.eventId, eventName: input.name, occurredAt: input.occurredAt, visitorId: attribution.visitorId, clickIds: { gclid: attribution.gclid, fbclid: attribution.fbclid, msclkid: attribution.msclkid }, value, currency, pageUrl }),
    ]);
  } catch {
    // Advertising delivery must never interrupt a product or payment flow.
  }
}

async function sendMeta(input: { eventId: string; eventName: string; occurredAt: Date; visitorId: string; fbclid: string | null; firstTouchAt: Date; pageUrl: string; value?: number; currency: string }) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  if (!pixelId || !token) return;
  const version = process.env.META_GRAPH_VERSION ?? "v24.0";
  const externalId = createHash("sha256").update(input.visitorId).digest("hex");
  const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: input.eventName,
        event_time: Math.floor(input.occurredAt.getTime() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.pageUrl,
        user_data: { external_id: [externalId], ...(input.fbclid ? { fbc: `fb.1.${Math.floor(input.firstTouchAt.getTime() / 1000)}.${input.fbclid}` } : {}) },
        custom_data: { currency: input.currency, ...(input.value == null ? {} : { value: input.value }) },
      }],
      ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
    }),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Meta conversion failed: ${response.status}`);
}

async function sendGoogle(input: { eventId: string; eventName: string; occurredAt: Date; visitorId: string; gclid: string | null; value?: number; currency: string }) {
  const token = process.env.GOOGLE_DATA_MANAGER_ACCESS_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "");
  const actionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;
  if (!token || !customerId || !actionId || !input.gclid) return;
  const loginId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, "");
  const response = await fetch("https://datamanager.googleapis.com/v1/events:ingest", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      destinations: [{ reference: "google_ads", operatingAccount: { accountType: "GOOGLE_ADS", accountId: customerId }, ...(loginId ? { loginAccount: { accountType: "GOOGLE_ADS", accountId: loginId } } : {}), productDestinationId: actionId }],
      events: [{ destinationReferences: ["google_ads"], transactionId: input.eventId, eventTimestamp: input.occurredAt.toISOString(), eventName: input.eventName, eventSource: "WEB", clientId: input.visitorId, adIdentifiers: { gclid: input.gclid }, conversionCount: 1, currency: input.currency, ...(input.value == null ? {} : { conversionValue: input.value }) }],
      consent: { adUserData: "CONSENT_GRANTED", adPersonalization: "CONSENT_GRANTED" },
    }),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Google conversion failed: ${response.status}`);
}

async function sendGeneric(payload: Record<string, unknown>) {
  const url = process.env.AD_CONVERSION_WEBHOOK_URL;
  if (!url) return;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(process.env.AD_CONVERSION_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.AD_CONVERSION_WEBHOOK_SECRET}` } : {}) },
    body: JSON.stringify(payload),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Conversion webhook failed: ${response.status}`);
}
