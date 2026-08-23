import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { AutopilotHero } from "@/components/marketing/autopilot-hero";
import { TrackedButtonLink } from "@/components/marketing/tracked-button-link";

export const metadata: Metadata = { title: "Features", description: "Know what is waiting, follow up automatically, and give every client one obvious next action.", alternates: { canonical: "/features" } };

const flow = [
  ["01", "Know what is waiting", "Approvals, file requests, replies and overdue invoices surface in one Waiting Room."],
  ["02", "Follow up automatically", "Autopilot sends a polite reminder on day 3 and day 7, then stops."],
  ["03", "Give one obvious action", "Clients open a secure link straight to the exact decision, upload or payment."],
  ["04", "Record the result", "Actions clear the blocker, update project history and unlock the next step."],
] as const;

const supporting = [
  ["Versioned approvals", "Compare versions, pin feedback and keep a timestamped record of every decision."],
  ["Smart file requests", "Ask for exact assets and keep every upload attached to its project."],
  ["Branded client portals", "Give clients a focused workspace without asking them to create an account."],
  ["Invoices and payments", "Keep invoice status with the project and accept payment through Stripe."],
  ["Project messaging", "Keep client conversations close to the work instead of scattered across inboxes."],
  ["Manual control", "Pause Autopilot or send a one-off reminder whenever the situation needs a human touch."],
] as const;

export default function FeaturesPage() {
  return <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><SiteNav/><main>
    <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container grid gap-12 py-14 sm:py-20 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The product</p><h1 className="mt-5 max-w-lg text-balance text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">One place for the work. <span className="font-editorial font-normal italic text-[#5d6857]">One less thing to remember.</span></h1><p className="mt-6 max-w-md text-sm leading-7 text-[#71736b]">ClientFold keeps the whole client loop together—from the first request to the reminder and the final recorded action.</p><TrackedButtonLink placement="features_hero" href="/waitlist" size="lg" className="mt-7 bg-[#2d302a]">Join early access</TrackedButtonLink></div><AutopilotHero/></div></section>
    <section className="border-b border-[#d9d8d2] py-20 sm:py-28"><div className="container"><div className="grid border-l border-t border-[#d5d4cd] md:grid-cols-4">{flow.map(([n,title,body],index)=><article key={n} className="min-h-64 border-b border-r border-[#d5d4cd] p-5"><div className="flex justify-between"><span className="font-mono text-[9px] text-[#999b93]">{n}</span><span className={`size-2 ${index===3?"bg-[#6fa367]":"border border-[#afb1a8]"}`}/></div><h2 className="mt-20 text-base font-medium">{title}</h2><p className="mt-3 text-[11px] leading-5 text-[#777970]">{body}</p></article>)}</div></div></section>
    <section className="border-b border-[#d9d8d2] bg-[#eeede7] py-20 sm:py-28"><div className="container grid gap-10 lg:grid-cols-[0.58fr_1.42fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Around the loop</p><h2 className="mt-4 max-w-sm text-4xl font-medium tracking-[-0.045em]">Everything clients need. Nothing they do not.</h2></div><div className="grid border-l border-t border-[#d0cfc8] sm:grid-cols-2">{supporting.map(([title,body])=><article key={title} className="min-h-48 border-b border-r border-[#d0cfc8] p-6"><h3 className="mt-8 text-base font-medium">{title}</h3><p className="mt-3 max-w-sm text-[11px] leading-5 text-[#777970]">{body}</p></article>)}</div></div></section>
    <section className="bg-[#2d302a] py-20 text-white"><div className="container flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><h2 className="max-w-xl text-4xl font-medium tracking-[-0.045em]">A professional client process that keeps moving without you hovering over it.</h2><TrackedButtonLink placement="features_final" href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a]">Join early access</TrackedButtonLink></div></section>
  </main><SiteFooter/></div>;
}
