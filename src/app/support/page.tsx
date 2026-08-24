import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { SupportSearch } from "@/components/support/support-search";
import { supportArticles } from "@/lib/support/articles";

export const metadata: Metadata = {
  title: "Support centre",
  description: "Practical ClientFold guides for projects, client portals, approvals, reminders, invoices and integrations.",
  alternates: { canonical: "/support" },
};

const quickAnswers = [
  ["Client cannot open a link", "Resend access from the client record and ask them to use the newest email.", "/support/invite-a-client"],
  ["A reminder did not send", "Check whether the item is complete, paused, scheduled for a weekend or has an invalid recipient.", "/support/configure-autopilot-reminders"],
  ["Payment status is delayed", "Confirm payment in Stripe, refresh the invoice and allow a short time for the verified event.", "/support/create-and-track-invoices"],
] as const;

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container py-16 sm:py-24">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">ClientFold support</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-7xl">Find the next step. <span className="font-editorial font-normal italic text-[#5d6857]">Keep the work moving.</span></h1>
              <div className="border-l border-[#d0cfc8] pl-6"><p className="text-sm leading-7 text-[#70736a]">Practical answers for setting up projects, inviting clients, collecting decisions and sorting out the occasional snag.</p><Link href="/contact?topic=support" className="mt-4 inline-block text-xs font-medium text-[#4f5b49] underline underline-offset-4">Contact support</Link></div>
            </div>
          </div>
        </section>

        <section className="container py-14 sm:py-20">
          <div className="mb-8"><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Knowledge base</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">How can we help?</h2></div>
          <SupportSearch articles={supportArticles} />
        </section>

        <section className="border-y border-[#d9d8d2] bg-[#eeede7] py-16 sm:py-20">
          <div className="container"><div className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Quick diagnosis</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.035em]">Three common snags</h2></div><div className="border-t border-[#d0cfc8]">{quickAnswers.map(([title, body, href], index) => <Link key={title} href={href} className="group grid gap-3 border-b border-[#d0cfc8] py-6 sm:grid-cols-[36px_0.65fr_1.35fr_auto]"><span className="font-mono text-[9px] text-[#9a9b94]">0{index + 1}</span><h3 className="text-sm font-medium">{title}</h3><p className="text-[11px] leading-5 text-[#777970]">{body}</p><span className="text-[#667260] transition-transform group-hover:translate-x-1" aria-hidden>→</span></Link>)}</div></div></div>
        </section>

        <section className="container py-16 sm:py-20"><div className="flex flex-col justify-between gap-6 border border-[#d4d3cc] bg-[#f1f0ea] p-7 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Still need a hand?</p><p className="mt-2 text-[11px] leading-5 text-[#777970]">Tell us what you were trying to do, what happened, and the page you were on. Do not include passwords, card numbers or secure portal links.</p></div><Link href="/contact?topic=support" className="inline-flex h-10 shrink-0 items-center bg-[#30342d] px-5 text-[11px] font-medium text-white">Ask ClientFold support</Link></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
