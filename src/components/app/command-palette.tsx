"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@/app/api/app/search/route";

type Action = { label: string; hint: string; href: string };

const QUICK_ACTIONS: Action[] = [
  { label: "New project", hint: "Create", href: "/projects/new" },
  { label: "Invite a client", hint: "Create", href: "/clients/new" },
  { label: "Waiting Room", hint: "Go to", href: "/waiting" },
  { label: "Invoices", hint: "Go to", href: "/invoices" },
  { label: "Billing", hint: "Go to", href: "/settings/billing" },
];

/**
 * ⌘K / Ctrl+K global search + quick actions. Opens on the shortcut or the
 * sidebar's "clientfold:command" event. Searches org-scoped projects, clients,
 * invoices and approvals; falls back to quick actions when the query is empty.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setHits([]);
    setActive(0);
  }, []);

  // Open triggers: keyboard shortcut + sidebar event.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    function onCmd() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("clientfold:command", onCmd);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("clientfold:command", onCmd);
    };
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/app/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setHits(json.hits ?? []);
        setActive(0);
      } catch {
        setHits([]);
      }
    }, 160);
    return () => clearTimeout(t);
  }, [q, open]);

  if (!open) return null;

  const showActions = q.trim().length < 2;
  const rows: { label: string; sublabel?: string; href: string }[] = showActions
    ? QUICK_ACTIONS.map((a) => ({ label: a.label, sublabel: a.hint, href: a.href }))
    : hits.map((h) => ({ label: h.label, sublabel: `${h.type}${h.sublabel ? " · " + h.sublabel : ""}`, href: h.href }));

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      go(rows[active].href);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh]" onClick={close}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <svg viewBox="0 0 24 24" className="size-4 text-muted-foreground" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search projects, clients, invoices, approvals…"
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="kbd">esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1.5">
          {showActions ? (
            <div className="px-3 pb-1 pt-1 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick actions
            </div>
          ) : rows.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">No matches for “{q}”.</div>
          ) : null}
          {rows.map((r, i) => (
            <button
              key={`${r.href}-${r.label}-${i}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.href)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] ${
                i === active ? "bg-muted" : ""
              }`}
            >
              <span className="truncate font-medium">{r.label}</span>
              {r.sublabel ? <span className="ml-3 shrink-0 text-2xs text-muted-foreground">{r.sublabel}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
