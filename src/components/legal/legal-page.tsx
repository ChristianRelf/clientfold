import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export type LegalSection = { title: string; content: React.ReactNode };

export function LegalPage({
  activeHref,
  documentNumber,
  eyebrow = "ClientFold legal",
  title,
  summary,
  contactEmail = "legal@clientfold.com",
  updated = "23 August 2026",
  sections,
}: {
  activeHref: string;
  documentNumber: string;
  eyebrow?: string;
  title: string;
  summary: string;
  contactEmail?: string;
  updated?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <LegalHeader activeHref={activeHref} />
      <main>
        <header className="relative overflow-hidden border-b border-[#3f453b] bg-[#252a24] text-[#f5f3eb]">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] opacity-50 lg:block" aria-hidden>
            <svg viewBox="0 0 560 300" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <path d="M80 40h270l130 130v180" stroke="#697364" strokeWidth="1" />
              <path d="M350 40v105c0 14 11 25 25 25h105" stroke="#8f9988" strokeWidth="1" />
              <path d="M26 92h230M26 136h180M26 180h250" stroke="#596255" strokeWidth="1" />
            </svg>
          </div>
          <div className="container relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_240px] lg:gap-24 lg:py-24">
            <div data-reveal="soft">
              <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#aeb7a8]">
                <span>{eyebrow}</span>
                <span className="h-px w-7 bg-[#687264]" aria-hidden />
                <span>Document {documentNumber}</span>
              </div>
              <h1 className="font-editorial mt-7 max-w-3xl text-balance text-5xl font-normal leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{title}</h1>
              <p className="mt-7 max-w-2xl text-[13px] leading-6 text-[#b9beb4] sm:text-sm sm:leading-7">{summary}</p>
            </div>
            <dl className="self-end border-t border-[#4e554b] pt-5 text-[10px] leading-5 text-[#aeb4aa] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-1">
                <dt className="uppercase tracking-[0.15em] text-[#7f897b]">Status</dt>
                <dd className="flex items-center gap-2 text-[#e2e4dc]"><span className="size-1.5 rounded-full bg-[#96a78e]" />Current</dd>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-1">
                <dt className="uppercase tracking-[0.15em] text-[#7f897b]">Last updated</dt>
                <dd className="text-[#e2e4dc]">{updated}</dd>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-1">
                <dt className="uppercase tracking-[0.15em] text-[#7f897b]">Questions</dt>
                <dd><a href={`mailto:${contactEmail}`} className="text-[#e2e4dc] underline decoration-[#657060] underline-offset-4 hover:text-white">{contactEmail}</a></dd>
              </div>
            </dl>
          </div>
        </header>
        <div className="container grid gap-12 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-20 lg:py-20">
          <aside>
            <nav className="lg:sticky lg:top-36" aria-label="On this page">
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a8c83]">On this page</p>
              <ol className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <Link href={`#section-${index + 1}`} className="group grid grid-cols-[28px_1fr] text-[11px] leading-5 text-[#777970] transition-colors hover:text-[#30332c]">
                      <span className="font-mono text-[9px] text-[#a0a198] group-hover:text-[#667260]">{String(index + 1).padStart(2, "0")}</span>
                      <span>{section.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="border-t border-[#d8d7d0]">
            {sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.title} data-reveal="soft" className="scroll-mt-36 border-b border-[#d8d7d0] py-9 sm:py-11">
                <div className="grid gap-5 sm:grid-cols-[48px_minmax(0,1fr)]">
                  <span className="font-mono text-[9px] text-[#9a9b94]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="max-w-3xl">
                    <h2 className="text-xl font-medium tracking-[-0.025em] text-[#30332c] sm:text-2xl">{section.title}</h2>
                    <div className="legal-copy mt-5 text-[13px] leading-6 text-[#62655d] sm:text-sm sm:leading-7">{section.content}</div>
                  </div>
                </div>
              </section>
            ))}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 border border-[#d6d5ce] bg-[#f1f0ea] p-6 sm:flex-row sm:items-center">
              <div><p className="text-sm font-medium text-[#34372f]">Questions about this document?</p><p className="mt-1 text-[11px] leading-5 text-[#777970]">We are happy to explain how it applies.</p></div>
              <a href={`mailto:${contactEmail}`} className="inline-flex h-9 items-center bg-[#30342d] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#464b42]">Contact us</a>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
