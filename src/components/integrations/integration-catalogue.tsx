"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { CATEGORY_LABELS, integrationRegistry, type IntegrationAvailability, type IntegrationCategory, type IntegrationProvider } from "@/lib/integrations/registry";
import { cn } from "@/lib/utils";

type RuntimeStatus = "connected" | "error" | "disabled";

const FILTERS: Array<{ id: "all" | IntegrationCategory; label: string }> = [
  { id: "all", label: "All" },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id: id as IntegrationCategory, label })),
];

const AVAILABILITY: Record<IntegrationAvailability, { label: string; tone: Parameters<typeof Badge>[0]["tone"]; rank: number }> = {
  available: { label: "Available", tone: "accent", rank: 1 },
  import_only: { label: "Import available", tone: "success", rank: 1 },
  approval_required: { label: "Requires provider approval", tone: "warning", rank: 2 },
  coming_soon: { label: "Coming soon", tone: "neutral", rank: 3 },
};

export function IntegrationCatalogue({ statuses }: { statuses: Partial<Record<IntegrationProvider, RuntimeStatus>> }) {
  const [category, setCategory] = useState<"all" | IntegrationCategory>("all");
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return integrationRegistry
      .filter((definition) => category === "all" || definition.category === category)
      .filter((definition) => !term || `${definition.name} ${definition.description} ${definition.capabilities.join(" ")} ${CATEGORY_LABELS[definition.category]}`.toLowerCase().includes(term))
      .sort((a, b) => {
        const aStatus = statuses[a.provider];
        const bStatus = statuses[b.provider];
        const aRank = aStatus === "connected" ? 0 : aStatus === "error" ? 4 : AVAILABILITY[a.availability].rank;
        const bRank = bStatus === "connected" ? 0 : bStatus === "error" ? 4 : AVAILABILITY[b.availability].rank;
        return aRank - bRank || a.name.localeCompare(b.name);
      });
  }, [category, query, statuses]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1" aria-label="Integration categories">
          {FILTERS.map((filter) => (
            <button key={filter.id} type="button" onClick={() => setCategory(filter.id)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", category === filter.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:text-foreground")}>{filter.label}</button>
          ))}
        </div>
        <label className="relative block min-w-0 sm:w-72">
          <span className="sr-only">Search integrations</span>
          <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          <input aria-label="Search integrations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plugins and integrations" className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-[13px] outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
        </label>
      </div>

      {matches.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((definition) => {
            const runtime = statuses[definition.provider];
            const state = runtime === "connected"
              ? { label: "Connected", tone: "success" as const }
              : runtime === "error"
                ? { label: "Error", tone: "danger" as const }
                : runtime === "disabled"
                  ? { label: "Setup required", tone: "neutral" as const }
                  : AVAILABILITY[definition.availability];
            const action = runtime === "connected" ? "Manage" : definition.availability === "coming_soon" ? "View details" : definition.availability === "approval_required" ? "Learn more" : definition.availability === "import_only" ? "Import" : "Set up";
            return (
              <article key={definition.provider} className="group flex min-h-60 flex-col rounded-xl border border-border bg-background p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <IntegrationLogo integration={definition} />
                  <Badge tone={state.tone}>{state.label}</Badge>
                </div>
                <div className="mt-4">
                  <div className="text-base font-semibold">{definition.name}</div>
                  <div className="mt-0.5 text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{CATEGORY_LABELS[definition.category]}</div>
                </div>
                <p className="mt-2 flex-1 text-[13px] leading-5 text-muted-foreground">{definition.description}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">{definition.capabilities.map((capability) => <span key={capability} className="rounded-md bg-muted px-2 py-1 text-2xs text-muted-foreground">{capability}</span>)}</div>
                  <Link href={definition.detailPath} className="shrink-0 text-xs font-semibold text-foreground hover:text-accent">{action} <span aria-hidden>→</span></Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-background py-16 text-center"><div className="text-sm font-medium">No integrations found</div><div className="mt-1 text-[13px] text-muted-foreground">Try another search or category.</div></div>
      )}
    </>
  );
}
