import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export const metadata: Metadata = { title: "Join early access", description: "Stop writing the next follow-up. Join ClientFold early access for freelancers.", alternates: { canonical: "/waitlist" } };

export default async function WaitlistPage({ searchParams }: { searchParams: Promise<{ plan?: string; ref?: string; lp?: string }> }) {
  const params = await searchParams;
  const source = params.lp ? `landing:${params.lp}` : params.plan ? `plan:${params.plan}` : params.ref ? `referral:${params.ref}` : undefined;
  return <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><SiteNav/><main className="border-b border-[#d9d8d2]"><div className="container grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_0.72fr]">
    <section className="flex flex-col justify-between border-[#d9d8d2] py-14 lg:border-r lg:py-20 lg:pr-16"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Early access for freelancers</p><h1 className="mt-6 max-w-xl text-balance text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-6xl">Stop writing the next follow-up.</h1><p className="mt-6 max-w-md text-sm leading-7 text-[#6f716a]">Join early access to the client portal that tracks approvals, files and invoices—and sends the polite reminders for you.</p></div><div className="mt-16 grid max-w-xl grid-cols-3 border-y border-[#d9d8d2] py-5 text-[9px] uppercase tracking-[0.12em] text-[#85877f]"><span>Private beta</span><span className="text-center">No card</span><span className="text-right">Clients need no account</span></div></section>
    <section className="flex items-center py-14 lg:pl-16"><div className="w-full max-w-md"><p className="text-[10px] uppercase tracking-[0.15em] text-[#697363]">Request your place</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.025em]">Three details. Then you are done.</h2><p className="mt-2 text-[11px] leading-5 text-[#7b7d75]">We use this to shape early access around independent client work.</p><div className="mt-7"><WaitlistForm source={source} referral={params.ref}/></div></div></section>
  </div></main><SiteFooter/></div>;
}
