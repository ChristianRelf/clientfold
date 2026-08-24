"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import type { NotificationView } from "@/lib/notifications";
import { NotificationCenter } from "@/components/app/notification-center";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number; emphasis?: boolean };

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5",
  projects: "M4 6h16M4 12h16M4 18h10",
  clients: "M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  waiting: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  inbox: "M4 13h4l2 3h4l2-3h4M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5",
  invoices: "M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1ZM9 8h6M9 12h6",
  files: "M4 5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z",
  integrations: "M9 8V5m6 3V5M8 11h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-2Zm4 6v3",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h5l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4L18.9 13c.1-.3.1-.7.1-1Z",
  help: "M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.4 1-1.4 1.9M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
};

export function Sidebar({
  org,
  user,
  waitingCount,
  inboxUnread = 0,
  notifications,
  onNavigate,
  theme = "light",
  onToggleTheme,
}: {
  org: { name: string; slug: string };
  user: { name: string | null; email: string };
  waitingCount: number;
  inboxUnread?: number;
  notifications: NotificationView[];
  onNavigate?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}) {
  const pathname = usePathname();

  const flow: NavItem[] = [
    { href: "/home", label: "Today", icon: <Icon d={ICONS.home} /> },
    { href: "/projects", label: "Projects", icon: <Icon d={ICONS.projects} /> },
    { href: "/waiting", label: "Waiting", icon: <Icon d={ICONS.waiting} />, badge: waitingCount, emphasis: true },
  ];

  const relationships: NavItem[] = [
    { href: "/inbox", label: "Inbox", icon: <Icon d={ICONS.inbox} />, badge: inboxUnread || undefined },
    { href: "/clients", label: "Clients", icon: <Icon d={ICONS.clients} /> },
  ];

  const resources: NavItem[] = [
    { href: "/invoices", label: "Invoices", icon: <Icon d={ICONS.invoices} /> },
    { href: "/files", label: "Files", icon: <Icon d={ICONS.files} /> },
    { href: "/settings/integrations", label: "Integrations", icon: <Icon d={ICONS.integrations} /> },
  ];

  const secondary: NavItem[] = [
    { href: "/settings", label: "Settings", icon: <Icon d={ICONS.settings} /> },
    { href: "/help", label: "Help", icon: <Icon d={ICONS.help} /> },
  ];

  const renderItem = (item: NavItem) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
          active ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
          item.emphasis && !active && "text-foreground",
        )}
      >
        {active ? <span className="absolute -left-2 h-5 w-0.5 rounded-r-full bg-accent" /> : null}
        <span className={cn("transition-transform group-hover:scale-105", active && "text-accent", item.emphasis && !active && "text-waiting")}>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums",
              item.emphasis ? "bg-waiting/15 text-waiting" : "bg-muted text-muted-foreground",
            )}
          >
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-[15.5rem] shrink-0 flex-col border-r border-border bg-surface/80">
      <div className="px-3 pb-2 pt-3">
        <div className="flex w-full items-center gap-2.5 rounded-lg border border-border/80 bg-background px-2.5 py-2.5 shadow-xs">
          <span className="relative grid size-7 place-items-center overflow-hidden rounded-md bg-foreground text-2xs font-semibold text-background">
            <span className="absolute -right-2 -top-2 size-4 rotate-45 bg-accent" />
            {initials(org.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{org.name}</span>
            <span className="block truncate text-2xs text-muted-foreground">Workspace</span>
          </span>
          <NotificationCenter notifications={notifications} />
        </div>
      </div>

      <Link
        href="/projects/new"
        onClick={onNavigate}
        className="mx-3 mb-2 flex items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background shadow-xs transition-transform hover:-translate-y-px"
      >
        <span className="text-base leading-none">+</span> New project
      </Link>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("clientfold:command"))}
        className="mx-3 mb-4 flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        aria-label="Find anything"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-left">Find anything</span>
        <span className="kbd">⌘K</span>
      </button>

      <nav className="flex-1 px-2">
        <NavGroup label="Flow">{flow.map(renderItem)}</NavGroup>
        <NavGroup label="Relationships">{relationships.map(renderItem)}</NavGroup>
        <NavGroup label="Resources">{resources.map(renderItem)}</NavGroup>
      </nav>

      <div className="space-y-0.5 border-t border-border/80 px-2 py-2">
        {secondary.map(renderItem)}
        {onToggleTheme ? (
          <button
            type="button"
            onClick={onToggleTheme}
            className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
              {theme === "dark" ? (
                <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M20 15.3A8.5 8.5 0 0 1 8.7 4 8.5 8.5 0 1 0 20 15.3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              )}
            </svg>
            <span className="flex-1 text-left">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        ) : null}
      </div>

      {/* User menu */}
      <div className="border-t border-border/80 p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <span className="grid size-7 place-items-center rounded-full border border-border bg-background text-2xs font-semibold">
            {initials(user.name ?? user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{user.name ?? "You"}</span>
            <span className="block truncate text-2xs text-muted-foreground">{user.email}</span>
          </span>
          <form action="/api/auth/logout" method="post">
            <button className="rounded p-1 text-muted-foreground hover:text-foreground" title="Log out" aria-label="Log out">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <path d="M15 12H4m0 0 3-3m-3 3 3 3M9 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 space-y-0.5 last:mb-0">
      <div className="mb-1 px-2.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-muted-foreground/65">{label}</div>
      {children}
    </div>
  );
}
