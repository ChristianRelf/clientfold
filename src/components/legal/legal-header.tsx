import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LEGAL_LINKS = [
  { href: "/legal", label: "Overview" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/acceptable-use", label: "Acceptable use" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/refunds", label: "Refunds" },
  { href: "/security", label: "Security" },
];

export function LegalHeader({ activeHref }: { activeHref: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d4d3cc] bg-[#f7f6f1]/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/" aria-label="ClientFold home" className="shrink-0">
            <Wordmark className="text-[15px]" />
          </Link>
          <span className="h-5 w-px bg-[#cfcec6]" aria-hidden />
          <Link href="/legal" className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-[#70736a] hover:text-[#2c2f28]">
            Legal centre
          </Link>
        </div>
        <Link href="/" className="group hidden items-center gap-2 text-[10px] font-medium text-[#70736a] transition-colors hover:text-[#2c2f28] sm:flex">
          Back to ClientFold
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
        </Link>
      </div>
      <div className="border-t border-[#dfded8]">
        <nav aria-label="Legal documents" className="container flex h-11 items-stretch gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
          {LEGAL_LINKS.map((link) => {
            const active = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center text-[11px] transition-colors",
                  active ? "font-medium text-[#2c3028]" : "text-[#7c7e76] hover:text-[#2c3028]",
                )}
              >
                {link.label}
                {active ? <span className="absolute inset-x-0 bottom-0 h-px bg-[#596453]" aria-hidden /> : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
