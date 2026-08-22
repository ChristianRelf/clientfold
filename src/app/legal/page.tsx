import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = { title: "Legal centre", description: "ClientFold terms, privacy information, cookie notice and acceptable use rules.", alternates: { canonical: "/legal" } };

const documents = [
  { number: "01", href: "/terms", title: "Terms of Service", body: "The agreement that governs use of ClientFold." },
  { number: "02", href: "/privacy", title: "Privacy Notice", body: "How we collect, use, share and protect personal information." },
  { number: "03", href: "/cookies", title: "Cookie Notice", body: "The cookies we use, why we use them and how to control them." },
  { number: "04", href: "/acceptable-use", title: "Acceptable Use", body: "The rules that keep ClientFold safe and useful for everyone." },
];

export default function LegalCentrePage() {
  return <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><SiteNav/><main><header className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container grid gap-8 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr]"><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">ClientFold legal</p><div data-reveal="soft"><h1 className="text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Clear terms. Plain language.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#6f716a]">The documents below explain the rules of the service and how information is handled. They are written to be useful, not hidden.</p></div></div></header><section className="container py-14 sm:py-20"><div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-2">{documents.map((doc, index) => <Link key={doc.href} href={doc.href} data-reveal="soft" style={{ transitionDelay: `${index * 70}ms` }} className="group min-h-56 border-b border-r border-[#d5d4cd] p-6 transition-colors hover:bg-[#f0efe9]"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[#96988f]">{doc.number}</span><span className="text-[#7b7d75] transition-transform group-hover:translate-x-1">→</span></div><h2 className="mt-16 text-xl font-medium tracking-tight">{doc.title}</h2><p className="mt-2 max-w-sm text-[11px] leading-5 text-[#777970]">{doc.body}</p></Link>)}</div><p className="mt-8 text-[11px] text-[#7b7d75]">Questions about these documents? Email <a className="underline underline-offset-4" href="mailto:legal@clientfold.com">legal@clientfold.com</a>.</p></section></main><SiteFooter/></div>;
}
