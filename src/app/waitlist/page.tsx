import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

export const metadata: Metadata = {
  title: "Join ClientFold early access",
  description: "Join ClientFold early access and spend less time chasing clients for approvals, files and invoices.",
  alternates: { canonical: "/waitlist" },
};

const workflow = [
  { label: "Approval requested", detail: "Homepage concept · v3", time: "Monday" },
  { label: "Polite reminder sent", detail: "ClientFold followed up", time: "Thursday" },
  { label: "Approved", detail: "No extra email needed", time: "Today", complete: true },
];

const benefits = [
  ["One calm client portal", "Approvals, files, messages and invoices stay together."],
  ["Follow-ups that send themselves", "ClientFold nudges at the right time, in your voice."],
  ["A clearer next move", "You and your client always know what is holding work up."],
];

const planNames: Record<string, string> = {
  free: "Free",
  solo: "Solo",
  studio: "Studio",
  agency: "Agency",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ref?: string; lp?: string }>;
}) {
  const params = await searchParams;
  const source = params.lp
    ? `landing:${params.lp}`
    : params.plan
      ? `plan:${params.plan}`
      : params.ref
        ? `referral:${params.ref}`
        : undefined;
  const selectedPlan = params.plan ? planNames[params.plan] : undefined;

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="overflow-hidden border-b border-[#d9d8d2]">
          <div className="container grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-w-0 py-14 sm:py-20 lg:min-h-[760px] lg:border-r lg:border-[#d9d8d2] lg:py-24 lg:pr-16">
              <div className="pointer-events-none absolute -left-24 bottom-16 hidden size-56 rounded-full bg-[#dfe5da]/70 blur-3xl lg:block" aria-hidden />
              <div className="relative flex h-full flex-col">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-[9px] font-medium uppercase tracking-[0.15em] text-[#667060]">
                    <span className="inline-flex items-center gap-2 border border-[#c7cec1] bg-[#eef1e9] px-3 py-2">
                      <span className="size-1.5 rounded-full bg-[#667b5d]" aria-hidden />
                      Private beta
                    </span>
                    <span>Built for freelancers and small teams</span>
                  </div>
                  <h1 className="mt-8 max-w-2xl text-balance text-[2.75rem] font-medium leading-[0.98] tracking-[-0.055em] sm:text-7xl sm:leading-[0.94] sm:tracking-[-0.06em]">
                    Do the work. Let ClientFold do the <span className="font-editorial font-normal italic text-[#5d6857]">chasing.</span>
                  </h1>
                  <p className="mt-7 max-w-xl text-sm leading-7 text-[#696c64] sm:text-base sm:leading-8">
                    Give clients one polished place to approve, upload, reply and pay—while thoughtful follow-ups keep every project moving.
                  </p>
                </div>

                <div className="relative mt-12 max-w-xl border border-[#cbcfc5] bg-[#f1f2ec] shadow-[0_24px_70px_-48px_rgba(40,44,35,0.65)] sm:mt-16">
                  <div className="flex items-center justify-between gap-4 border-b border-[#d2d5cc] px-5 py-4">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#7c8176]">Live workflow</p>
                      <p className="mt-1 text-xs font-medium">Homepage approval</p>
                    </div>
                    <span className="shrink-0 border border-[#d4c8b7] bg-[#f5ede1] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-[#7b674c]">Waiting on client</span>
                  </div>
                  <ol className="px-5 py-2">
                    {workflow.map((item, index) => (
                      <li key={item.label} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border-b border-[#d9dbd3] py-4 last:border-0">
                        <span className={`flex size-6 items-center justify-center rounded-full text-[9px] ${item.complete ? "bg-[#60705a] text-white" : "border border-[#c9cdc3] bg-[#f8f8f4] text-[#858a7f]"}`} aria-hidden>
                          {item.complete ? "✓" : index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-medium text-[#3c4038]">{item.label}</span>
                          <span className="mt-1 block text-[9px] text-[#888b83]">{item.detail}</span>
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-[#92958d]">{item.time}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="border-t border-[#d2d5cc] bg-[#e7ece3] px-5 py-3 text-[9px] text-[#5e6859]">
                    Three steps moved forward. Zero follow-up emails written by you.
                  </div>
                </div>

                <div className="mt-16 grid max-w-xl gap-3 border-t border-[#d9d8d2] pt-8 text-[9px] uppercase tracking-[0.12em] text-[#81847b] sm:grid-cols-3 sm:gap-4 lg:mt-auto">
                  <span>No credit card</span>
                  <span className="sm:text-center">Useful updates only</span>
                  <span className="sm:text-right">Leave anytime</span>
                </div>
              </div>
            </div>

            <div className="relative -mx-6 flex min-w-0 items-center overflow-hidden bg-[#282b24] px-6 py-14 text-white lg:mx-0 lg:px-12 lg:py-20 xl:px-16">
              <div className="pointer-events-none absolute right-8 top-8 size-28 border border-white/10" aria-hidden>
                <span className="absolute right-0 top-0 size-9 border-b border-l border-white/10 bg-white/[0.025]" />
              </div>
              <div className="relative w-full">
                <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/45">Request early access</p>
                <h2 className="mt-4 max-w-md text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                  Be one of the first to put client follow-up on autopilot.
                </h2>
                <p className="mt-4 max-w-sm text-xs leading-6 text-white/55">
                  Tell us a little about how you work. We will invite the best-fit teams in small, supported groups.
                </p>

                {selectedPlan ? (
                  <div className="mt-6 flex items-center justify-between border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px]">
                    <span className="text-white/50">Your selected plan</span>
                    <span className="font-medium text-[#d9e1d3]">{selectedPlan}</span>
                  </div>
                ) : null}
                {params.ref ? (
                  <p className="mt-5 border-l-2 border-[#8fa085] pl-3 text-[10px] leading-5 text-white/60">You were invited by a ClientFold member. We will keep that referral attached to your request.</p>
                ) : null}

                <div className="mt-8 border border-white/10 bg-[#f8f7f2] p-5 text-[#292b26] shadow-[0_28px_80px_-35px_rgba(0,0,0,0.7)] sm:p-7">
                  <div className="mb-6 flex items-center justify-between border-b border-[#dfded7] pb-4">
                    <div>
                      <p className="text-xs font-medium">Join the waitlist</p>
                      <p className="mt-1 text-[9px] text-[#85877f]">Three details · less than a minute</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#e8ede4] text-sm text-[#5f6f59]" aria-hidden>→</span>
                  </div>
                  <WaitlistForm source={source} referral={params.ref} />
                </div>

                <p className="mt-5 text-center text-[9px] leading-4 text-white/35">
                  Questions before joining? Email <a href="mailto:hello@useclientfold.com" className="text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white">hello@useclientfold.com</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2] bg-[#efeee8]">
          <div className="container grid gap-px bg-[#d7d6cf] md:grid-cols-3">
            {benefits.map(([title, description], index) => (
              <div key={title} className="bg-[#efeee8] px-6 py-10 sm:px-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#989a92]">0{index + 1}</span>
                  <span className="size-1.5 rounded-full bg-[#71806a]" aria-hidden />
                </div>
                <h2 className="mt-8 text-lg font-medium tracking-[-0.02em]">{title}</h2>
                <p className="mt-3 max-w-sm text-[11px] leading-5 text-[#74776f]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
