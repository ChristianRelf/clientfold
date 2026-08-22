import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { GuidedDemo } from "@/components/marketing/guided-demo";

export const metadata = {
  title: "Interactive demo",
  description: "Follow a client project from blocker to approval. No signup required.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f3f2ed] text-[#292b26]">
      <header className="sticky top-0 z-40 border-b border-[#d9d8d2] bg-[#f3f2ed]/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label="Back to ClientFold home">
            <Wordmark className="text-[15px]" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden text-xs text-[#73756d] transition-colors hover:text-[#2c2f28] sm:inline">Exit demo</Link>
            <ButtonLink href="/waitlist" size="sm" className="bg-[#2c2f28] px-4 hover:bg-[#44473f]">Join the waitlist</ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-[#d9d8d2]">
          <div className="container pb-12 pt-12 sm:pb-14 sm:pt-16">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.62fr] lg:items-end">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#596453]">The ClientFold walkthrough</p>
                <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium leading-[0.98] tracking-[-0.05em] text-[#242620] sm:text-6xl">One project. Three sides of the story.</h1>
              </div>
              <div className="border-l border-[#cfcec7] pl-5 lg:pl-7">
                <p className="max-w-sm text-sm leading-6 text-[#666860]">Find what is holding up the work, capture a clear decision, then see the same project through your client’s eyes.</p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-[#85877f]">Interactive · Sample data · About 2 minutes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 sm:py-12">
          <GuidedDemo />
        </section>

        <section className="relative overflow-hidden border-t border-[#d9d8d2] bg-[#2d302a] text-[#f5f4ef]">
          <div className="absolute right-0 top-0 size-28 border-b border-l border-white/10 bg-white/[0.025] sm:size-40" aria-hidden />
          <div className="container relative grid min-h-[340px] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-between border-white/10 py-14 lg:border-r lg:py-16 lg:pr-16">
              <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.16em] text-white/45"><span className="size-1.5 rounded-full bg-[#aab8a1]" /> Your turn</div>
              <h2 className="mt-14 max-w-2xl text-balance text-[2.4rem] font-medium leading-[0.98] tracking-[-0.05em] sm:text-[3.35rem]">What if the next step was <span className="font-editorial font-normal italic text-[#c7d0c1]">always this clear?</span></h2>
            </div>
            <div className="flex flex-col justify-between border-t border-white/10 py-10 lg:border-t-0 lg:py-16 lg:pl-14">
              <div className="flex items-start justify-between gap-8">
                <p className="max-w-sm text-sm leading-6 text-white/60">Bring projects, decisions and client actions into one calm workspace—and keep the work moving without another follow-up thread.</p>
                <span className="hidden font-mono text-[9px] text-white/25 sm:block">03 / 03</span>
              </div>
              <div className="mt-10">
                <ButtonLink href="/waitlist" size="lg" className="group h-12 bg-[#f3f2ed] px-5 text-[#2d302a] hover:bg-white">Join the private beta <span className="ml-4 transition-transform group-hover:translate-x-1" aria-hidden>→</span></ButtonLink>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[9px] uppercase tracking-[0.12em] text-white/35"><span>No card required</span><span>Early access</span><span>Founder-led onboarding</span></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
