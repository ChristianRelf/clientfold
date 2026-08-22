import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export type LegalSection = { title: string; content: React.ReactNode };

export function LegalPage({ eyebrow = "Legal", title, summary, updated = "22 August 2026", sections }: { eyebrow?: string; title: string; summary: string; updated?: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <header className="border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container grid gap-8 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr]">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">{eyebrow}</p><p className="mt-6 text-[10px] text-[#898b82]">Last updated<br/><span className="mt-1 inline-block text-[#555850]">{updated}</span></p></div>
            <div data-reveal="soft"><h1 className="text-balance text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#6f716a]">{summary}</p></div>
          </div>
        </header>
        <div className="container grid gap-10 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
          <aside className="lg:pr-12"><nav className="lg:sticky lg:top-28"><p className="text-[9px] uppercase tracking-[0.14em] text-[#8a8c83]">On this page</p><ol className="mt-4 space-y-2">{sections.map((section, index) => <li key={section.title}><Link href={`#section-${index + 1}`} className="text-[11px] text-[#74766e] hover:text-[#30332c]">{String(index + 1).padStart(2, "0")} · {section.title}</Link></li>)}</ol></nav></aside>
          <div className="border-t border-[#d8d7d0]">{sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title} data-reveal="soft" className="scroll-mt-24 border-b border-[#d8d7d0] py-8"><div className="grid gap-5 sm:grid-cols-[40px_1fr]"><span className="font-mono text-[9px] text-[#9a9b94]">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-lg font-medium tracking-tight">{section.title}</h2><div className="legal-copy mt-4 text-[13px] leading-6 text-[#666960]">{section.content}</div></div></div></section>)}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
