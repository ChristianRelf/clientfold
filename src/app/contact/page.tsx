import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";

export const metadata: Metadata = { title: "Contact", description: "Talk to ClientFold about the product, support, billing, privacy or a new integration.", alternates: { canonical: "/contact" } };

const routes = [
  ["Product & partnerships", "Questions about early access, fit or working together.", "hello@clientfold.com"],
  ["Support", "Help with an account, project, client portal or integration.", "support@clientfold.com"],
  ["Privacy & legal", "Data rights, privacy questions and legal notices.", "privacy@clientfold.com"],
] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const topic = (await searchParams).topic;
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><SiteNav /><main>
      <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Contact ClientFold</p><p className="mt-7 max-w-sm text-sm leading-7 text-[#71736b]">A question, a snag or a tool you wish connected—we would like to hear the practical version.</p></div><h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-7xl">Start with what you are trying to <span className="font-editorial font-normal italic text-[#5d6857]">move forward.</span></h1></div></section>
      <section className="container grid gap-12 py-14 sm:py-20 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20"><aside><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Direct routes</p><div className="mt-6 border-t border-[#d5d4cd]">{routes.map(([title, body, email]) => <div key={email} className="border-b border-[#d5d4cd] py-5"><h2 className="text-sm font-medium">{title}</h2><p className="mt-2 text-[11px] leading-5 text-[#777970]">{body}</p><a href={`mailto:${email}`} className="mt-3 inline-block text-[10px] text-[#52604d] underline underline-offset-4">{email}</a></div>)}</div><div className="mt-7 bg-[#eeede7] p-5"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#697363]">Need an answer now?</p><p className="mt-2 text-[11px] leading-5 text-[#777970]">Our support centre covers setup, approvals, reminders, invoices and imports.</p><Link href="/support" className="mt-3 inline-block text-[10px] font-medium text-[#52604d] underline underline-offset-4">Browse support articles</Link></div></aside><div><div className="mb-7"><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Send a message</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Give us the useful details.</h2><p className="mt-3 text-[11px] leading-5 text-[#777970]">We will route your message to the right person. Support replies are normally sent by email.</p></div><ContactForm initialTopic={topic} /></div></section>
    </main><SiteFooter /></div>
  );
}
