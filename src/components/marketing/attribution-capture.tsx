"use client";

import { useEffect } from "react";

export function AttributionCapture() {
  useEffect(() => {
    const capture = () => {
      const params = new URLSearchParams(location.search);
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"] as const;
      const payload: Record<string, string> = { landingPage: `${location.pathname}${location.search}`, referrer: document.referrer };
      for (const key of keys) { const value = params.get(key); if (value) payload[key] = value; }
      if (document.cookie.includes("cf_consent_analytics=1") || document.cookie.includes("cf_consent_advertising=1")) {
        navigator.sendBeacon?.("/api/attribution", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      }
    };
    capture();
    window.addEventListener("clientfold:consent-changed", capture);
    return () => window.removeEventListener("clientfold:consent-changed", capture);
  }, []);
  return null;
}
