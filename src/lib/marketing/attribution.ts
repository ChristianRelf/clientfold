import { cookies, headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

/**
 * First-party, privacy-conscious attribution. A first-party visitor id is stored
 * in a cookie; first-touch UTM/click ids are preserved forever, latest-touch is
 * refreshed each visit. When a visitor later signs up we link the Attribution
 * row to the user/organisation without losing first-touch.
 */

const VISITOR_COOKIE = process.env.NEXT_PUBLIC_ATTRIBUTION_COOKIE ?? "cf_attrib";
const VISITOR_TTL_MS = 1000 * 60 * 60 * 24 * 365; // 1 year

export type TouchParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  landingPage?: string;
  referrer?: string;
};

export function parseTouch(searchParams: URLSearchParams, landingPage: string, referrer?: string): TouchParams {
  const get = (k: string) => searchParams.get(k) ?? undefined;
  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_term: get("utm_term"),
    utm_content: get("utm_content"),
    gclid: get("gclid"),
    fbclid: get("fbclid"),
    msclkid: get("msclkid"),
    landingPage,
    referrer,
  };
}

/** Read the visitor id from the cookie, or null (does not set — see ensure). */
export async function getVisitorId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(VISITOR_COOKIE)?.value ?? null;
}

/** Ensure a visitor id cookie exists and return it. Call from a route/action. */
export async function ensureVisitorId(): Promise<string> {
  const jar = await cookies();
  let id = jar.get(VISITOR_COOKIE)?.value;
  if (!id) {
    id = randomBytes(16).toString("hex");
    jar.set(VISITOR_COOKIE, id, {
      httpOnly: false, // readable by first-party client for consent-gated events
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_TTL_MS / 1000,
    });
  }
  return id;
}

/**
 * Record a touch. First-touch fields are only written on insert; latest-touch is
 * always updated. Respects consent: pass `analyticsConsent=false` to skip.
 */
export async function recordTouch(visitorId: string, touch: TouchParams, analyticsConsent = true): Promise<void> {
  if (!analyticsConsent) return;
  try {
    const existing = await db.attribution.findUnique({ where: { visitorId } });
    if (!existing) {
      await db.attribution.create({
        data: {
          visitorId,
          firstUtmSource: touch.utm_source,
          firstUtmMedium: touch.utm_medium,
          firstUtmCampaign: touch.utm_campaign,
          firstUtmTerm: touch.utm_term,
          firstUtmContent: touch.utm_content,
          firstReferrer: touch.referrer,
          firstLandingPage: touch.landingPage,
          lastUtmSource: touch.utm_source,
          lastUtmMedium: touch.utm_medium,
          lastUtmCampaign: touch.utm_campaign,
          lastLandingPage: touch.landingPage,
          gclid: touch.gclid,
          fbclid: touch.fbclid,
          msclkid: touch.msclkid,
        },
      });
    } else {
      await db.attribution.update({
        where: { visitorId },
        data: {
          lastUtmSource: touch.utm_source ?? existing.lastUtmSource,
          lastUtmMedium: touch.utm_medium ?? existing.lastUtmMedium,
          lastUtmCampaign: touch.utm_campaign ?? existing.lastUtmCampaign,
          lastLandingPage: touch.landingPage ?? existing.lastLandingPage,
          lastTouchAt: new Date(),
          gclid: touch.gclid ?? existing.gclid,
          fbclid: touch.fbclid ?? existing.fbclid,
          msclkid: touch.msclkid ?? existing.msclkid,
        },
      });
    }
  } catch {
    // Never block navigation on attribution writes.
  }
}

/** Link an anonymous visitor's attribution to a user/org at signup time. */
export async function linkAttribution(visitorId: string, ids: { userId?: string; organisationId?: string }) {
  try {
    await db.attribution.updateMany({ where: { visitorId }, data: ids });
  } catch {
    /* noop */
  }
}

export async function clientIpHint(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
}
