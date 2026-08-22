"use client";

import { useEffect } from "react";
import type { MarketingEventName } from "@/lib/marketing/events";

/**
 * Fire-and-forget client event. Consent-gated: only sends when the analytics
 * cookie category is granted (essential events like page_view for conversion
 * measurement are allowed; advertising pixels are gated separately).
 */
export function Track({
  event,
  metadata,
}: {
  event: MarketingEventName;
  metadata?: Record<string, string | number>;
}) {
  useEffect(() => {
    const consent = document.cookie.includes("cf_consent_analytics=1");
    if (!consent && event !== "marketing.page_view") return;
    navigator.sendBeacon?.(
      "/api/events",
      new Blob([JSON.stringify({ name: event, path: location.pathname, metadata })], {
        type: "application/json",
      }),
    );
  }, [event, metadata]);
  return null;
}
