import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Legal centre",
  description: "ClientFold terms, privacy, accessibility, refund, security, cookie and acceptable use documents.",
  alternates: { canonical: "/legal" },
};

const documents = [
  { number: "01", href: "/terms", title: "Terms of Service", body: "The agreement governing accounts, subscriptions, client work, payments and use of ClientFold.", meta: "18 sections" },
  { number: "02", href: "/privacy", title: "Privacy Notice", body: "What personal information we handle, why we use it, who receives it and your rights.", meta: "14 sections" },
  { number: "03", href: "/cookies", title: "Cookie Notice", body: "The cookies and similar technologies we use, their duration and how to control them.", meta: "6 sections" },
  { number: "04", href: "/acceptable-use", title: "Acceptable Use", body: "The boundaries that keep ClientFold lawful, secure and useful for every workspace.", meta: "6 sections" },
  { number: "05", href: "/accessibility", title: "Accessibility Statement", body: "Our accessibility goal, known limitations and the route for reporting a barrier or requesting an alternative.", meta: "6 sections" },
  { number: "06", href: "/refunds", title: "Refund & Cancellation", body: "How to stop renewal, request a refund and ask us to correct a subscription billing problem.", meta: "7 sections" },
  { number: "07", href: "/security", title: "Security & Disclosure", body: "A practical overview of safeguards and how to report a potential vulnerability responsibly.", meta: "6 sections" },
];

export default function LegalCentrePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <LegalHeader activeHref="/legal" />
      <main>
        <header className="relative overflow-hidden border-b border-[#3f453b] bg-[#252a24] text-[#f5f3eb]">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-50 lg:block" aria-hidden>
            <svg viewBox="0 0 640 360" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <path d="M115 28h292l142 142v218" stroke="#697364" />
              <path d="M407 28v114c0 15 13 28 28 28h114" stroke="#8f9988" />
              <path d="M46 96h252M46 145h198M46 194h274M46 243h225" stroke="#596255" />
            </svg>
          </div>
          <div className="container relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_260px] lg:gap-24 lg:py-28">
            <div data-reveal="soft">
              <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#aeb7a8]"><span>ClientFold legal</span><span className="h-px w-8 bg-[#687264]" /></div>
              <h1 className="font-editorial mt-7 max-w-3xl text-balance text-5xl font-normal leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Clear agreements.<br />No hidden corners.</h1>
              <p className="mt-7 max-w-xl text-[13px] leading-6 text-[#b9beb4] sm:text-sm sm:leading-7">Our legal documents explain the rules of the service and how information is handled-in language designed to be read, not buried.</p>
            </div>
            <div className="self-end border-t border-[#4e554b] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#7f897b]">Document set</p>
              <p className="mt-2 text-sm text-[#e2e4dc]">7 current documents</p>
              <p className="mt-5 text-[10px] leading-5 text-[#aeb4aa]">Last reviewed<br /><span className="text-[#e2e4dc]">24 August 2026</span></p>
            </div>
          </div>
        </header>

        <section className="container py-14 sm:py-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#878980]">Document library</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-[#30332c]">Choose a document</h2></div>
            <p className="max-w-sm text-[11px] leading-5 text-[#7b7d75]">Each page includes a table of contents, current status and direct contact details.</p>
          </div>
          <div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-2">
            {documents.map((doc, index) => (
              <Link key={doc.href} href={doc.href} data-reveal="soft" style={{ transitionDelay: `${index * 70}ms` }} className="group relative min-h-64 overflow-hidden border-b border-r border-[#d5d4cd] p-6 transition-colors hover:bg-[#efeee8]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#96988f]">Document {doc.number}</span>
                  <span className="grid size-8 place-items-center rounded-full border border-[#c7c7bf] text-[#6d7168] transition-all group-hover:translate-x-1 group-hover:border-[#667260] group-hover:bg-[#667260] group-hover:text-white" aria-hidden>→</span>
                </div>
                <div className="mt-16">
                  <h3 className="font-editorial text-2xl tracking-[-0.025em] text-[#30332c] sm:text-3xl">{doc.title}</h3>
                  <p className="mt-3 max-w-md text-[11px] leading-5 text-[#777970]">{doc.body}</p>
                </div>
                <p className="absolute bottom-6 right-6 font-mono text-[8px] uppercase tracking-[0.1em] text-[#a0a198]">{doc.meta}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[#d8d7d0] pt-6 text-[11px] text-[#777970] sm:flex-row sm:items-center">
            <p>Questions or need a copy of a document?</p>
            <a className="font-medium text-[#4f5b49] underline underline-offset-4" href="mailto:legal@useclientfold.com">legal@useclientfold.com</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
