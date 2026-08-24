import type { Metadata } from "next";
import Link from "next/link";
import { MarketingGlyph } from "@/components/brand/marketing-glyph";
import { AutopilotHero } from "@/components/marketing/autopilot-hero";
import { HeroWorkspace } from "@/components/marketing/hero-workspace";
import { ProductTour } from "@/components/marketing/product-tour";
import { ScrollFeatureStory } from "@/components/marketing/scroll-feature-story";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TrackedButtonLink } from "@/components/marketing/tracked-button-link";
import { getVisitorId } from "@/lib/marketing/attribution";
import { getVariant } from "@/lib/marketing/experiments";

export const metadata: Metadata = {
  title: "ClientFold - The client portal that follows up for you",
  description: "Keep approvals, files and invoices moving with a client portal that sends polite follow-ups automatically.",
  alternates: { canonical: "/" },
};

const stages = [
  ["01", "Plan", "Turn a new engagement into a clear path from kickoff to completion."],
  ["02", "Gather", "Collect the words, files and context that keep work moving."],
  ["03", "Review", "Make feedback precise and every sign-off a durable decision."],
  ["04", "Close", "Deliver professionally, collect payment and leave a clear record."],
] as const;

const faq = [
  ["Will ClientFold pester my clients?", "No. Autopilot sends one polite reminder after 3 days and one final reminder after 7 days, on weekdays only. Then it stops."],
  ["What happens when the client acts?", "The reminder sequence stops immediately and the action becomes part of the project history."],
  ["Do clients need an account?", "No. Each reminder opens a secure client link with one clear action."],
  ["Can I stay in control?", "Yes. Pause Autopilot on any item or send a manual reminder whenever you prefer."],
] as const;

const softwareJsonLd = {
  "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ClientFold", applicationCategory: "BusinessApplication", operatingSystem: "Web",
  description: "A client portal for freelancers that tracks client actions and sends polite follow-ups automatically.", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
};
const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };

export default async function HomePage() {
  const heroVariant = await getVariant(await getVisitorId(), "hero_copy", {
    key: "control",
    name: "Control",
    payload: { headline: "Client work.", emphasis: "Without the chase.", description: "A client portal that turns approvals, files, feedback and invoices into one obvious next step-then follows up for you." },
  });
  const headline = typeof heroVariant.payload.headline === "string" ? heroVariant.payload.headline : "Client work.";
  const emphasis = typeof heroVariant.payload.emphasis === "string" ? heroVariant.payload.emphasis : "Without the chase.";
  const heroDescription = typeof heroVariant.payload.description === "string" ? heroVariant.payload.description : "A client portal that turns approvals, files, feedback and invoices into one obvious next step-then follows up for you.";
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteNav />
      <main>
        <section className="overflow-hidden border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container pb-20 pt-12 lg:pb-24 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-12">
              <div data-reveal="soft">
                <span className="inline-flex items-center gap-2 border-b border-[#949c8d] pb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#56604f]"><span className="hero-live-dot size-1.5 rounded-full bg-[#de7044]" /> The client portal that keeps moving</span>
                <h1 className="mt-7 max-w-xl text-balance text-[3.65rem] font-medium leading-[0.88] tracking-[-0.07em] text-[#242620] sm:text-[5.55rem] lg:text-[6rem]">{headline}<br /><span className="font-editorial font-normal italic tracking-[-0.05em] text-[#5d6857]">{emphasis}</span></h1>
                <p className="mt-7 max-w-md text-pretty text-[16px] leading-7 text-[#5e6059]">{heroDescription}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3"><TrackedButtonLink placement="homepage_hero" href="/waitlist" size="lg" className="bg-[#242620] px-6 hover:bg-[#3b3d36]">Join early access <span aria-hidden>→</span></TrackedButtonLink><Link href="/demo" className="inline-flex h-11 items-center border-b border-[#8f9388] px-1 text-[11px] font-medium text-[#4f584b]">Try the full demo <span className="ml-2" aria-hidden>↗</span></Link></div>
                <p className="mt-5 text-[9px] uppercase tracking-[0.13em] text-[#8a8c83]">Private beta · No card · Clients need no account</p>
              </div>
              <div data-reveal><HeroWorkspace /></div>
            </div>
            <div className="momentum-rail mt-12 overflow-hidden border-y border-[#d7d6cf] py-3" aria-label="ClientFold activity">
              <div className="momentum-track flex w-max items-center text-[9px] uppercase tracking-[0.13em] text-[#767970]">
                {[0, 1].map((copy) => <div key={copy} className="flex items-center" aria-hidden={copy === 1}>{["Approval received", "Brand files uploaded", "Invoice paid", "Feedback resolved", "Project moved forward"].map((item) => <span key={item} className="flex items-center gap-5 px-6"><span className="size-1.5 rounded-full bg-[#74806b]" />{item}</span>)}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2] bg-[#f7f6f1]">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">One shared picture</p><h2 className="mt-4 max-w-md text-balance text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">The client loop. Finally closed.</h2><p className="mt-4 max-w-sm text-xs leading-5 text-[#777970]">No more hunting across inboxes, folders and payment links to work out what happens next.</p></div>
            <div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-3">
              {[["approval", "Clients always know what needs them."], ["file", "You spend less time writing follow-ups."], ["invoice", "Every decision stays with the project."]].map(([glyph, body], index) => <article key={body} data-reveal="soft" style={{ transitionDelay: `${index * 80}ms` }} className="benefit-card min-h-48 border-b border-r border-[#d5d4cd] p-5"><span className="font-mono text-[9px] text-[#999b93]">0{index + 1}</span><MarketingGlyph type={glyph as "approval" | "file" | "invoice"} className="mt-8 text-[#596453]" /><p className="mt-5 max-w-[13rem] text-sm font-medium leading-6 text-[#41443d]">{body}</p></article>)}
            </div>
          </div>
        </section>

        <section id="autopilot" className="border-b border-[#d9d8d2] bg-[#eeede7] py-20 sm:py-28">
          <div className="container"><div className="mb-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Follow-up Autopilot</p><h2 className="mt-4 max-w-lg text-balance text-3xl font-medium tracking-[-0.04em] sm:text-4xl">The polite nudge you never have to remember.</h2></div><p className="max-w-md border-l border-[#cbcac3] pl-5 text-sm leading-6 text-[#6f7169]">Day 3. Day 7. Weekdays only. The moment your client acts, ClientFold stops-and the project moves.</p></div><div data-reveal><AutopilotHero /></div></div>
        </section>

        <ScrollFeatureStory />

        <section id="workflow" className="border-b border-[#d9d8d2] py-20 sm:py-28">
          <div className="container"><div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">A connected workflow</p><h2 className="mt-4 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">One clear action keeps the whole project moving.</h2></div><p className="max-w-md border-l border-[#d5d4cd] pl-5 text-sm leading-6 text-[#73756d]">Every client action updates the project automatically-from your desk, to your client, and back again.</p></div>
            <div className="workflow-sequence relative mt-16 grid border-l border-t border-[#d5d4cd] sm:grid-cols-2 lg:grid-cols-4"><div className="workflow-progress absolute -top-px left-0 hidden h-px w-full bg-[#d5d4cd] lg:block" aria-hidden />{[["01", "Send", "Share a design, file request or invoice."], ["02", "Surface", "Your client sees one focused next action."], ["03", "Record", "Their approval, upload or payment is captured."], ["04", "Move", "The timeline updates and the next step opens."]].map(([number, title, body], index) => <article key={title} data-reveal="soft" style={{ transitionDelay: `${index * 90}ms` }} className="workflow-card relative min-h-52 border-b border-r border-[#d5d4cd] p-5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[#92948c]">{number}</span><span className={`grid size-7 place-items-center rounded-full text-[10px] ${index === 3 ? "bg-[#667260] text-white" : "border border-[#aeb0a7] bg-[#f7f6f1] text-[#73766d]"}`}>{index === 3 ? "✓" : "→"}</span></div><h3 className="mt-14 text-sm font-medium text-[#31342d]">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[#777970]">{body}</p></article>)}</div></div>
        </section>

        <section id="product" className="border-b border-[#d9d8d2] bg-[#f3f2ed] py-20 sm:py-28"><div className="container"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Inside ClientFold</p><h2 className="mt-4 max-w-xl text-balance text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Don’t imagine it. Click through it.</h2></div><p className="max-w-xs text-xs leading-5 text-[#74766e]">Switch between the studio workspace and the focused portal your clients actually use.</p></div><div data-reveal><ProductTour /></div></div></section>

        <section className="border-b border-[#d9d8d2] py-20 sm:py-28"><div className="container"><div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The product map</p><h2 className="mt-4 max-w-lg text-balance text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">From first brief to final payment.</h2></div><p className="max-w-md border-l border-[#d5d4cd] pl-5 text-sm leading-6 text-[#73756d]">A small set of connected moments, made for the real rhythm of client work.</p></div><div className="mt-12 grid border-l border-t border-[#d0cfc8] sm:grid-cols-2 lg:grid-cols-4">{stages.map(([number, title, body]) => <article key={title} className="flex min-h-56 flex-col justify-between border-b border-r border-[#d0cfc8] p-6"><span className="font-mono text-[9px] text-[#999b93]">{number}</span><div><h3 className="text-2xl font-medium tracking-[-0.03em] text-[#30332c]">{title}</h3><p className="mt-3 max-w-xs text-[11px] leading-5 text-[#777970]">{body}</p></div></article>)}</div></div></section>

        <section className="border-b border-[#d9d8d2] bg-[#f3f2ed] py-20 sm:py-24"><div className="container grid gap-10 lg:grid-cols-[0.72fr_1.28fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Solo · £12/month</p><h2 className="mt-4 max-w-md text-4xl font-medium tracking-[-0.045em]">The plan that gives you your follow-up time back.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#71736b]">Start free with manual reminders. Move to Solo when you want ClientFold to follow up automatically.</p></div><div className="border border-[#c5c9c0] bg-[#eef0e9] p-7"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">Solo</p><p className="mt-1 text-xs text-[#73766d]">For freelancers who bill clients.</p></div><p className="text-3xl font-medium">£12<span className="text-sm text-[#777970]">/mo</span></p></div><ul className="mt-8 grid gap-3 border-t border-[#d3d7ce] pt-6 text-xs sm:grid-cols-2">{["Follow-up Autopilot", "10 active projects", "Unlimited clients", "Custom branding", "Invoices and approvals", "25 GB storage"].map((item) => <li key={item} className="flex gap-2"><span className="text-[#5e7657]">✓</span>{item}</li>)}</ul><TrackedButtonLink placement="homepage_pricing" href="/waitlist?plan=solo" className="mt-7 w-full bg-[#2d302a]">Join Solo early access</TrackedButtonLink></div></div></section>

        <section className="border-b border-[#d9d8d2] py-20 sm:py-28"><div className="container grid gap-10 lg:grid-cols-[0.62fr_1.38fr]"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Before you hand over the chase</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">Questions, answered.</h2></div><div className="border-t border-[#d5d4cd]">{faq.map(([question, answer], index) => <article key={question} className="grid gap-3 border-b border-[#d5d4cd] py-6 sm:grid-cols-[32px_0.8fr_1.2fr]"><span className="font-mono text-[9px] text-[#999b93]">0{index + 1}</span><h3 className="text-sm font-medium">{question}</h3><p className="text-[11px] leading-5 text-[#777970]">{answer}</p></article>)}</div></div></section>

        <section className="overflow-hidden bg-[#2d302a] text-white"><div className="container relative grid min-h-[420px] lg:grid-cols-2"><div className="cta-fold-mark pointer-events-none absolute right-6 top-8 hidden size-36 border border-white/10 lg:block" aria-hidden><span className="absolute right-0 top-0 size-12 border-b border-l border-white/15 bg-white/[0.03]" /></div><div className="flex flex-col justify-between border-white/10 py-16 lg:border-r lg:pr-16"><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Your move</p><h2 className="mt-16 max-w-xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl">Your next follow-up could be the <span className="font-editorial font-normal italic text-[#c7d0c1]">last one you write.</span></h2></div><div className="relative z-10 flex flex-col justify-end py-16 lg:pl-16"><p className="max-w-sm text-sm leading-6 text-white/60">Join early access and give clients one beautiful place to approve, upload, reply and pay-while ClientFold keeps the momentum.</p><div className="mt-7 flex flex-wrap gap-3"><TrackedButtonLink placement="homepage_final" href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a] hover:bg-white">Get early access <span aria-hidden>→</span></TrackedButtonLink><TrackedButtonLink placement="homepage_final_demo" href="/demo" size="lg" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">Try the demo</TrackedButtonLink></div></div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
