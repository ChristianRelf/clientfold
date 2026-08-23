"use client";

import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/button";

export function fireMarketingEvent(name: string, metadata?: Record<string, string | number>) {
  const consent = document.cookie.includes("cf_consent_analytics=1");
  if (!consent && name !== "marketing.page_view") return;
  navigator.sendBeacon?.("/api/events", new Blob([JSON.stringify({ name, path: location.pathname, metadata })], { type: "application/json" }));
}

export function TrackedButtonLink({ placement, onClick, ...props }: ComponentProps<typeof ButtonLink> & { placement: string }) {
  return <ButtonLink {...props} onClick={(event) => { fireMarketingEvent("marketing.cta_clicked", { placement, page: location.pathname }); onClick?.(event); }} />;
}
