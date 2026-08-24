"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { cn } from "@/lib/utils";
import type { NotificationView } from "@/lib/notifications";
import { NotificationCenter } from "@/components/app/notification-center";

type ShellProps = {
  org: { name: string; slug: string };
  user: { name: string | null; email: string };
  waitingCount: number;
  inboxUnread: number;
  notifications: NotificationView[];
  children: React.ReactNode;
};

type CommandItem = { label: string; detail: string; href: string; shortcut?: string };

const destinations: CommandItem[] = [
  { label: "Today", detail: "Your next move and workday flow", href: "/home", shortcut: "H" },
  { label: "Projects", detail: "Timelines, milestones and health", href: "/projects", shortcut: "P" },
  { label: "Waiting room", detail: "Everything blocked on a client", href: "/waiting", shortcut: "W" },
  { label: "Inbox", detail: "Client conversations", href: "/inbox", shortcut: "I" },
  { label: "Invoices", detail: "Sent, viewed and paid", href: "/invoices", shortcut: "V" },
  { label: "Files", detail: "Shared project files", href: "/files", shortcut: "F" },
  { label: "Clients", detail: "People and companies", href: "/clients", shortcut: "C" },
  { label: "Integrations", detail: "Plugins, marketplaces and connected tools", href: "/settings/integrations", shortcut: "G" },
];

const createActions: CommandItem[] = [
  { label: "Start a new project", detail: "Create a workspace and invite a client", href: "/projects/new" },
  { label: "Add a client", detail: "Create a new client record", href: "/clients/new" },
];

export function AppShell({ org, user, waitingCount, inboxUnread, notifications, children }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("clientfold-theme");
    const next = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setMobileOpen(false);
      }
    };
    const onOpenCommand = () => setCommandOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("clientfold:command", onOpenCommand);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("clientfold:command", onOpenCommand);
    };
  }, []);

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [commandOpen]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    const all = [...destinations, ...createActions];
    return term ? all.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(term)) : all;
  }, [query]);

  useEffect(() => setActiveIndex(0), [query]);

  const navigate = (href: string) => {
    setCommandOpen(false);
    setMobileOpen(false);
    router.push(href);
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("clientfold-theme", next);
      return next;
    });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <div className="hidden shrink-0 lg:block">
        <Sidebar org={org} user={user} waitingCount={waitingCount} inboxUnread={inboxUnread} notifications={notifications} theme={theme} onToggleTheme={toggleTheme} />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={cn(
            "h-full w-[min(19rem,88vw)] transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Sidebar org={org} user={user} waitingCount={waitingCount} inboxUnread={inboxUnread} notifications={notifications} onNavigate={() => setMobileOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 lg:hidden">
          <div className="flex items-center gap-1">
          <NotificationCenter notifications={notifications} />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-border bg-surface"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
          </div>
          <span className="text-sm font-semibold tracking-tight">ClientFold</span>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-border bg-surface"
            onClick={() => setCommandOpen(true)}
            aria-label="Search and quick actions"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>

      <MobileDock pathname={pathname} waitingCount={waitingCount} inboxUnread={inboxUnread} />

      {commandOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/25 px-4 pt-[12vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-pop animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-label="Search and quick actions"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((current) => Math.min(current + 1, matches.length - 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((current) => Math.max(current - 1, 0));
                  }
                  if (event.key === "Enter" && matches[activeIndex]) navigate(matches[activeIndex].href);
                }}
                placeholder="Find a page or start something…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="kbd">ESC</span>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              {matches.length ? (
                matches.map((item, index) => (
                  <button
                    type="button"
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn("group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", activeIndex === index ? "bg-surface" : "hover:bg-surface")}
                  >
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border border-border text-xs", index >= destinations.length && !query ? "bg-accent text-accent-foreground" : "bg-background")}>
                      {item.shortcut ?? "+"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
                    </span>
                    <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>→</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-10 text-center text-[13px] text-muted-foreground">No matching page or action.</div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border bg-surface/70 px-4 py-2 text-2xs text-muted-foreground">
              <span>Search across your workspace</span>
              <span>↵ to open</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const mobileDestinations = [
  { href: "/home", label: "Today", path: "M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5" },
  { href: "/projects", label: "Projects", path: "M4 6h16M4 12h16M4 18h10" },
  { href: "/waiting", label: "Waiting", path: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" },
  { href: "/inbox", label: "Inbox", path: "M4 13h4l2 3h4l2-3h4M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" },
];

function MobileDock({ pathname, waitingCount, inboxUnread }: { pathname: string; waitingCount: number; inboxUnread: number }) {
  const beforeCreate = mobileDestinations.slice(0, 2);
  const afterCreate = mobileDestinations.slice(2);

  const item = (destination: (typeof mobileDestinations)[number]) => {
    const active = pathname === destination.href || (pathname.startsWith(`${destination.href}/`) && pathname !== "/projects/new");
    const badge = destination.href === "/waiting" ? waitingCount : destination.href === "/inbox" ? inboxUnread : 0;
    return (
      <Link
        key={destination.href}
        href={destination.href}
        aria-current={active ? "page" : undefined}
        className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-medium transition-colors", active ? "bg-surface text-foreground" : "text-muted-foreground")}
      >
        <svg viewBox="0 0 24 24" className={cn("size-[17px]", active && "text-accent")} fill="none" aria-hidden>
          <path d={destination.path} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{destination.label}</span>
        {badge ? <span className="absolute right-2 top-1 grid min-w-4 place-items-center rounded-full bg-waiting px-1 text-[8px] font-bold leading-4 text-white">{badge > 9 ? "9+" : badge}</span> : null}
      </Link>
    );
  };

  return (
    <nav aria-label="Quick navigation" className="safe-area-dock fixed inset-x-3 z-30 mx-auto grid max-w-[26rem] grid-cols-5 items-center rounded-[1.25rem] border border-border/80 bg-background/95 p-1.5 shadow-pop backdrop-blur-xl lg:hidden">
      {beforeCreate.map(item)}
      <Link href="/projects/new" aria-label="New project" className="mx-auto -mt-5 grid size-12 place-items-center rounded-full border-4 border-background bg-foreground text-xl text-background shadow-md transition-transform active:scale-95">+</Link>
      {afterCreate.map(item)}
    </nav>
  );
}
