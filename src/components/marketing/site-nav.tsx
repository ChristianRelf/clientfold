import Link from "next/link";
import { FoldMascot } from "@/components/brand/fold-mascot";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Track } from "./track";

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#workflow", label: "How it works" },
  { href: "/for/freelancers", label: "For freelancers" },
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d8d2] bg-[#f3f2ed]/90 backdrop-blur-md">
      <Track event="marketing.page_view" />
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="ClientFold home">
            <Wordmark className="text-[15px]" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-[#73756d] transition-colors hover:text-[#2c2f28]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-xs text-[#73756d] hover:text-[#2c2f28] sm:inline">Log in</Link>
          <FoldMascot pose="greeting" size="sm" className="-mr-2 hidden md:block" />
          <ButtonLink href="/waitlist" size="sm" className="bg-[#2c2f28] px-4 hover:bg-[#44473f]">
            Join the waitlist
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
