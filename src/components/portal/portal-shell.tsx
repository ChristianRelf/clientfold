"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The client portal shell — deliberately simpler and calmer than the agency app.
 * Top brand bar + a segmented nav that collapses to a bottom bar on mobile.
 * Unused sections are hidden by the caller (pass only the tabs that apply).
 */

export type PortalTab = { key: string; label: string; href: string; badge?: number };

export function PortalShell({
  brand,
  projectName,
  clientName,
  tabs,
  poweredBy = true,
  basePath = "/portal",
  children,
}: {
  brand: string;
  projectName: string;
  clientName: string;
  tabs: PortalTab[];
  poweredBy?: boolean;
  basePath?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      {/* Brand bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{brand}</div>
            <div className="truncate text-2xs text-muted-foreground">{projectName}</div>
          </div>
          <div className="text-right text-2xs text-muted-foreground">{clientName}</div>
        </div>
        {/* Desktop / tablet nav */}
        <nav className="mt-3 hidden gap-1 sm:flex">
          {tabs.map((t) => (
            <NavLink key={t.key} tab={t} active={isActive(pathname, t.href, basePath)} />
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-5 pb-24 sm:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background/95 backdrop-blur sm:hidden">
        {tabs.map((t) => {
          const active = isActive(pathname, t.href, basePath);
          return (
            <Link
              key={t.key}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-2xs font-medium",
                active ? "text-accent" : "text-muted-foreground",
              )}
            >
              <span className="relative">
                {t.label}
                {t.badge ? (
                  <span className="absolute -right-3 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] text-accent-foreground">
                    {t.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      {poweredBy ? (
        <footer className="border-t border-border px-4 py-3 text-center text-2xs text-muted-foreground">
          <Link href="/?ref=portal" className="hover:text-foreground">
            Powered by ClientFold
          </Link>
        </footer>
      ) : null}
    </div>
  );
}

function NavLink({ tab, active }: { tab: PortalTab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className={cn(
        "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {tab.label}
      {tab.badge ? (
        <span className="ml-1.5 rounded-full bg-accent/15 px-1.5 text-2xs text-accent">{tab.badge}</span>
      ) : null}
    </Link>
  );
}

function isActive(pathname: string, href: string, basePath: string): boolean {
  if (href === basePath) return pathname === basePath;
  return pathname === href || pathname.startsWith(href + "/");
}
