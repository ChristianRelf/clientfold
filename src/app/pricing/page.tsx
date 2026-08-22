import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Track } from "@/components/marketing/track";

export const metadata: Metadata = { title: "Pricing", description: "Explore ClientFold plans and join the early-access waitlist.", alternates: { canonical: "/pricing" } };

const faq = [
  ["Is there a free plan?", "Yes—one active project, two clients and 1 GB storage, free for as long as you need it."],
  ["Do clients pay?", "No. Invited clients can view portals, upload files, approve work and pay invoices without a ClientFold subscription."],
  ["Do you take an invoice fee?", "No. Client payments go through your own connected Stripe account. Stripe's standard processing fees still apply."],
  ["Can I cancel whenever I like?", "Yes. Cancel before renewal and paid features continue until the end of the current billing period."],
  ["Can I remove ClientFold branding?", "Yes. Solo, Studio and Agency plans can present the portal as part of your own client experience."],
  ["Is my client data kept separate?", "Yes. Access is scoped to each organisation and files are delivered through short-lived signed links."],
];

export default function PricingPage() {
  return <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><Track event="marketing.pricing_viewed"/><SiteNav/><main><header className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container grid gap-8 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Pricing</p><p className="mt-6 text-[10px] leading-5 text-[#8a8c83]">Your clients never pay.<br/>No percentage taken from invoices.</p></div><div data-reveal="soft"><h1 className="max-w-2xl text-balance text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">Start with one project. Grow when the work does.</h1><p className="mt-5 max-w-lg text-sm leading-6 text-[#71736b]">Straightforward monthly plans with every client-facing essential included.</p></div></div></header><section className="border-b border-[#d9d8d2] py-14 sm:py-20"><div className="container" data-reveal><PricingTable/></div></section><section className="py-20 sm:py-28"><div className="container grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Questions, answered</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.035em]">The details before you decide.</h2></div><div className="border-t border-[#d5d4cd]">{faq.map(([q,a],index)=><article key={q} data-reveal="soft" className="grid gap-3 border-b border-[#d5d4cd] py-6 sm:grid-cols-[34px_1fr_1.35fr]"><span className="font-mono text-[9px] text-[#989a92]">{String(index+1).padStart(2,"0")}</span><h3 className="text-sm font-medium">{q}</h3><p className="text-[11px] leading-5 text-[#777970]">{a}</p></article>)}</div></div></section></main><SiteFooter/></div>;
}
