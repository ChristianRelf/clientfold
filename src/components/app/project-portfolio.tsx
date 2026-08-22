"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HEALTH_LABEL, type Health } from "@/lib/health";
import { cn } from "@/lib/utils";

type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  client: string;
  progress: number;
  health: Health;
  healthReason: string | null;
  target: string | null;
};

const HEALTH_TONE: Record<Health, Parameters<typeof Badge>[0]["tone"]> = {
  on_track: "success",
  waiting_on_client: "waiting",
  at_risk: "warning",
  overdue: "danger",
};

type Filter = "all" | "attention" | "on_track";

export function ProjectPortfolio({ projects }: { projects: ProjectSummary[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !term || `${project.name} ${project.client}`.toLowerCase().includes(term);
      const matchesFilter = filter === "all" || (filter === "on_track" ? project.health === "on_track" : project.health !== "on_track");
      return matchesSearch && matchesFilter;
    });
  }, [filter, projects, query]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-background p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface/50 px-3 sm:max-w-sm">
          <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-muted-foreground" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project or client" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="flex gap-1 overflow-x-auto" aria-label="Filter projects">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All <span>{projects.length}</span></FilterButton>
          <FilterButton active={filter === "attention"} onClick={() => setFilter("attention")}>Needs attention</FilterButton>
          <FilterButton active={filter === "on_track"} onClick={() => setFilter("on_track")}>On track</FilterButton>
        </div>
      </div>

      {shown.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(8rem,1fr)_minmax(9rem,0.7fr)_auto] gap-5 border-b border-border bg-surface/70 px-5 py-2.5 text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
            <span>Project</span><span>Progress</span><span>Target</span><span>Health</span>
          </div>
          {shown.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="group grid gap-4 border-b border-border/70 px-4 py-4 transition-colors last:border-0 hover:bg-surface/45 sm:px-5 md:grid-cols-[minmax(0,1.6fr)_minmax(8rem,1fr)_minmax(9rem,0.7fr)_auto] md:items-center md:gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold tracking-tight">{project.name}</span><span className="text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden>→</span></div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{project.client}</div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground"><span className="md:hidden">Progress</span><span className="font-mono">{project.progress}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} /></div>
              </div>
              <div className="flex items-center justify-between text-xs md:block"><span className="text-muted-foreground md:hidden">Target</span><span className={cn(!project.target && "text-muted-foreground")}>{project.target ?? "Not set"}</span></div>
              <div className="flex items-center justify-between gap-3 md:justify-end"><span className="text-xs text-muted-foreground md:hidden">Health</span><Badge tone={HEALTH_TONE[project.health]}>{HEALTH_LABEL[project.health]}</Badge></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background px-5 py-16 text-center">
          <p className="text-sm font-medium">No projects match this view.</p>
          <button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-2 text-xs font-medium text-accent hover:underline">Clear filters</button>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface hover:text-foreground")}>{children}</button>;
}
