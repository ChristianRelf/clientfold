"use client";

import { useMemo, useState } from "react";
import { WaitingItemRow } from "./waiting-item";
import { formatMoney } from "@/lib/format";
import { waitingSummary, type DemoWaitingItem, type WaitingType } from "@/lib/demo/data";
import { cn } from "@/lib/utils";

type SortKey = "longest" | "newest" | "client" | "value";
type FilterKey = "all" | WaitingType;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "longest", label: "Longest waiting" },
  { key: "newest", label: "Newest" },
  { key: "client", label: "Client" },
  { key: "value", label: "Value" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approval", label: "Approvals" },
  { key: "file_request", label: "Files" },
  { key: "payment", label: "Payments" },
  { key: "task", label: "Tasks" },
  { key: "reply", label: "Replies" },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-3">
      <div className="text-lg font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="text-2xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function WaitingBoard({
  items,
  demo = false,
  currency = "GBP",
}: {
  items: DemoWaitingItem[];
  demo?: boolean;
  currency?: string;
}) {
  const [sort, setSort] = useState<SortKey>("longest");
  const [filter, setFilter] = useState<FilterKey>("all");

  const summary = useMemo(() => waitingSummary(items), [items]);

  const visible = useMemo(() => {
    const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);
    const sorted = [...filtered];
    switch (sort) {
      case "longest":
        sorted.sort((a, b) => b.daysWaiting - a.daysWaiting);
        break;
      case "newest":
        sorted.sort((a, b) => a.daysWaiting - b.daysWaiting);
        break;
      case "client":
        sorted.sort((a, b) => a.clientCompany.localeCompare(b.clientCompany));
        break;
      case "value":
        sorted.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
        break;
    }
    return sorted;
  }, [items, filter, sort]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      {/* Summary strip */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-surface sm:grid-cols-4">
        <Stat value={formatMoney(summary.outstanding, currency)} label="Outstanding" />
        <Stat value={String(summary.approvals)} label="Approvals" />
        <Stat value={String(summary.fileRequests)} label="File requests" />
        <Stat value={String(summary.count)} label="Total items" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Items */}
      <div>
        {visible.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium">Nothing waiting on your clients.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              You&apos;re caught up. Items requiring client action will appear here.
            </p>
          </div>
        ) : (
          visible.map((item) => <WaitingItemRow key={item.id} item={item} demo={demo} />)
        )}
      </div>
    </div>
  );
}
