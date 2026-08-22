import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Showcase } from "@/components/marketing/showcase";
import { ScrollFeatureStory } from "@/components/marketing/scroll-feature-story";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Features", description: "The Waiting Room, version-tracked approvals, a branded client portal, files, invoices and Stripe payments.", alternates: { canonical: "/features" } };

const features = [
  ["01", "Waiting Room", "Every approval, file, payment and decision still sitting with a client—in one view."],
  ["02", "Versioned approvals", "Share work, resolve comments and keep a timestamped record of every sign-off."],
  ["03", "Client portal", "Give each client a focused space showing what needs them and what happens next."],
  ["04", "File requests", "Ask for exact assets and keep every upload attached to the right project."],
  ["05", "Invoices", "Create project-linked invoices and accept payment through your connected Stripe account."],
  ["06", "Thoughtful reminders", "Send a clear nudge with history, so your team never duplicates the chase."],
];

export default function FeaturesPage() {
  return <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]"><SiteNav/><main><section className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.68fr_1.32fr] lg:items-center"><div data-reveal="soft"><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Product</p><h1 className="mt-5 max-w-md text-balance text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">Everything moves through one clear workspace.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-[#71736b]">From the first file request to final payment, ClientFold keeps your team and client looking at the same project truth.</p><ButtonLink href="/waitlist" size="lg" className="mt-7 bg-[#2d302a] hover:bg-[#44473f]">Join the waitlist</ButtonLink></div><div data-reveal><Showcase kind="waiting"/></div></div></section><ScrollFeatureStory/><section className="border-b border-[#d9d8d2] py-20 sm:py-28"><div className="container"><div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The whole system</p><h2 className="mt-4 max-w-sm text-3xl font-medium tracking-[-0.035em]">Small tools, deliberately connected.</h2></div><div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-2">{features.map(([number,title,body], index) => <article key={title} data-reveal="soft" style={{transitionDelay:`${(index%2)*70}ms`}} className="min-h-52 border-b border-r border-[#d5d4cd] p-6"><span className="font-mono text-[9px] text-[#999b93]">{number}</span><h3 className="mt-12 text-base font-medium">{title}</h3><p className="mt-2 max-w-sm text-[11px] leading-5 text-[#777970]">{body}</p></article>)}</div></div></div></section><section className="bg-[#2d302a] py-20 text-white"><div className="container flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><h2 className="max-w-lg text-3xl font-medium tracking-[-0.035em] sm:text-4xl">A professional client experience, without another complicated system.</h2><ButtonLink href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a] hover:bg-white">Join the waitlist</ButtonLink></div></section></main><SiteFooter/></div>;
}
