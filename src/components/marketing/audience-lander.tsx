import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Showcase } from "@/components/marketing/showcase";
import { PricingTable } from "@/components/marketing/pricing-table";
import { AutopilotHero } from "@/components/marketing/autopilot-hero";

type AudienceLanderProps = {
  eyebrow: string;
  headline: string;
  subhead: string;
  pains: string[];
  showcase?: "waiting" | "approval" | "portal";
  autopilot?: boolean;
};

const outcomes = [
  {
    number: "01",
    title: "Make the next move obvious",
    body: "Clients open one focused workspace and immediately see what needs their attention.",
  },
  {
    number: "02",
    title: "Keep decisions attached",
    body: "Every approval, file and message stays with the project instead of disappearing into a thread.",
  },
  {
    number: "03",
    title: "Move work forward",
    body: "Your team can see what is blocked, send a thoughtful reminder and keep momentum without guesswork.",
  },
];

export function AudienceLander({
  eyebrow,
  headline,
  subhead,
  pains,
  showcase = "waiting",
  autopilot = false,
}: AudienceLanderProps) {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="overflow-hidden border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container py-14 sm:py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16">
              <div data-reveal="soft">
                <p className="inline-flex items-center gap-2 border-b border-[#949c8d] pb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#56604f]">
                  <span className="size-1.5 rounded-full bg-[#64705c]" />
                  {eyebrow}
                </p>
                <h1 className="mt-7 max-w-2xl text-balance text-[3.25rem] font-medium leading-[0.96] tracking-[-0.058em] text-[#242620] sm:text-[4.5rem] lg:text-[5rem]">
                  {headline}
                </h1>
                <p className="mt-7 max-w-lg border-l border-[#bfc1b8] pl-5 text-pretty text-[15px] leading-7 text-[#666860]">
                  {subhead}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/waitlist" size="lg" className="bg-[#242620] px-6 hover:bg-[#3b3d36]">
                    Join early access
                  </ButtonLink>
                  <ButtonLink href="/demo" size="lg" variant="outline" className="border-[#bfc0b8] bg-transparent px-6 hover:bg-white/60">
                    Try the demo <span aria-hidden>→</span>
                  </ButtonLink>
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-[#84867e]">
                  Private beta · No card required
                </p>
              </div>

              <div className="relative" data-reveal>
                <div className="absolute -right-3 -top-3 hidden h-24 w-24 border-r border-t border-[#aeb1a7] sm:block" aria-hidden />
                {autopilot ? <AutopilotHero /> : <Showcase kind={showcase} />}
                <div className="absolute -bottom-5 left-5 hidden items-center gap-3 border border-[#d1d1c9] bg-[#fbfbf7] px-3.5 py-2.5 shadow-[0_12px_35px_-18px_rgba(35,39,31,0.5)] sm:flex">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#dfe4da] text-xs text-[#596453]">✓</span>
                  <span>
                    <span className="block text-[10px] font-medium text-[#34372f]">Client action completed</span>
                    <span className="text-[8px] text-[#84867e]">The project can move again</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2]">
          <div className="container grid lg:grid-cols-[0.68fr_1.32fr]">
            <div className="border-[#d9d8d2] py-16 lg:border-r lg:py-20 lg:pr-14">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The familiar pattern</p>
              <h2 className="mt-4 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl">
                Great work should not need constant chasing.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#73756d]">
                ClientFold gathers every loose end into one calm, shared view.
              </p>
            </div>
            <div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-3 lg:border-l-0 lg:border-t-0">
              {pains.map((pain, index) => (
                <article key={pain} data-reveal="soft" style={{ transitionDelay: `${index * 70}ms` }} className="flex min-h-48 flex-col justify-between border-b border-r border-[#d5d4cd] p-5 lg:min-h-64 lg:border-b-0">
                  <span className="font-mono text-[9px] text-[#999b93]">0{index + 1}</span>
                  <p className="max-w-[12rem] text-sm font-medium leading-6 text-[#41443d]">{pain}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2] bg-[#eeede7] py-20 sm:py-28">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">A calmer workflow</p>
                <h2 className="mt-4 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl">
                  One place for the work and the next step.
                </h2>
              </div>
              <div className="grid border-l border-t border-[#d0cfc8] sm:grid-cols-3">
                {outcomes.map((outcome, index) => (
                  <article key={outcome.number} data-reveal="soft" style={{ transitionDelay: `${index * 70}ms` }} className="min-h-64 border-b border-r border-[#d0cfc8] p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#92948c]">{outcome.number}</span>
                      <span className={`size-2 ${index === outcomes.length - 1 ? "bg-[#667260]" : "border border-[#aeb0a7]"}`} />
                    </div>
                    <h3 className="mt-16 text-base font-medium text-[#31342d]">{outcome.title}</h3>
                    <p className="mt-3 text-[11px] leading-5 text-[#74766e]">{outcome.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="container">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end" data-reveal="soft">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Simple from day one</p>
                <h2 className="mt-4 max-w-xl text-balance text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Pricing that grows with your client work.</h2>
              </div>
              <p className="max-w-xs text-xs leading-5 text-[#74766e]">Start with the workspace you need now. Move plans as the number of active clients grows.</p>
            </div>
            <PricingTable />
          </div>
        </section>

        <section className="bg-[#2d302a] text-[#f5f4ef]">
          <div className="container grid min-h-[390px] lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col justify-between border-white/10 py-16 lg:border-r lg:pr-16 lg:py-20">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">The client experience, sorted</p>
              <h2 className="mt-16 max-w-xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Less chasing.<br />
                <span className="font-editorial font-normal italic text-white/70">More momentum.</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end py-16 lg:pl-16 lg:py-20">
              <p className="max-w-sm text-sm leading-6 text-white/60">Give every client one clear place to approve, upload, pay and keep the work moving.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a] hover:bg-white">Join early access</ButtonLink>
                <ButtonLink href="/demo" size="lg" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">View demo</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
