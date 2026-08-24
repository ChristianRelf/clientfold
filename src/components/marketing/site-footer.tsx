import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { CookieSettingsButton } from "@/components/marketing/cookie-settings-button";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Demo" },
      { href: "/integrations", label: "Integrations" },
      { href: "/client-approval-software", label: "Client approvals" },
    ],
  },
  {
    title: "For",
    links: [
      { href: "/for/freelancers", label: "Freelancers" },
      { href: "/for/design-studios", label: "Design studios" },
      { href: "/for/web-design-agencies", label: "Web agencies" },
      { href: "/for/consultants", label: "Consultants" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookie notice" },
      { href: "/acceptable-use", label: "Acceptable use" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/refunds", label: "Refunds" },
      { href: "/security", label: "Security" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d9d8d2] bg-[#eeede7]">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Wordmark className="text-sm" />
          <p className="mt-3 max-w-xs text-[12px] leading-5 text-[#74766e]">
            The client portal that follows up for you.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#555850]">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[11px] text-[#7b7d75] hover:text-[#34372f]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container flex flex-col items-start justify-between gap-2 border-t border-[#d9d8d2] py-5 text-[9px] uppercase tracking-[0.1em] text-[#85877f] sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} ClientFold</span>
        <div className="flex items-center gap-4"><CookieSettingsButton className="hover:text-[#34372f]" /><Link href="/legal" className="hover:text-[#34372f]">Legal centre</Link></div>
      </div>
    </footer>
  );
}
