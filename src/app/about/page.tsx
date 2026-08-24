import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TrackedButtonLink } from "@/components/marketing/tracked-button-link";

export const metadata: Metadata = {
  title: "About",
  description: "ClientFold exists to make client work feel calm, clear and fair for independent teams and the people they serve.",
  alternates: { canonical: "/about" },
};

const principles = [
  ["Clarity over theatre", "Every screen should answer one practical question: what needs to happen next?"],
  ["Automation with manners", "Useful reminders should feel considerate, stop at the right moment and always leave people in control."],
  ["A shared record", "Files, decisions, feedback and payment status belong with the work-not scattered across private inboxes."],
  ["Small teams, first", "Independent studios and consultants deserve the operational polish of a large firm without its overhead."],
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="overflow-hidden border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:py-28">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#697363]">About ClientFold</p>
              <p className="mt-8 max-w-sm text-sm leading-7 text-[#74766e]">Built for the people doing excellent client work-and losing too many hours to chasing the next approval, file or invoice.</p>
            </div>
            <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-7xl lg:text-[5.5rem]">Good work should not get stuck in the <span className="font-editorial font-normal italic text-[#5d6857]">gaps between people.</span></h1>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2]">
          <div className="container grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.55fr_1.45fr]">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Our mission</p><span className="mt-5 block h-px w-16 bg-[#879181]" /></div>
            <div>
              <h2 className="max-w-4xl text-balance text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">To make client work feel calm, clear and fair by turning every loose end into one obvious next step.</h2>
              <div className="mt-10 grid gap-6 border-t border-[#d5d4cd] pt-8 text-sm leading-7 text-[#6f7169] sm:grid-cols-2">
                <p>Client work rarely stalls because people do not care. It stalls because the decision is buried in a thread, the right file is in another folder, or nobody is quite sure who owns the next move.</p>
                <p>ClientFold brings those moments into one shared place. It gives clients a focused action, gives teams a durable record, and handles the polite follow-up without turning the relationship into a sequence of chasers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2] bg-[#eeede7] py-20 sm:py-24">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
              <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">What guides us</p><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">Quietly opinionated.</h2></div>
              <p className="max-w-lg text-sm leading-6 text-[#73756d]">The product is young. These principles are the standard we use to decide what belongs-and what does not.</p>
            </div>
            <div className="mt-12 grid border-l border-t border-[#d0cfc8] sm:grid-cols-2">
              {principles.map(([title, body], index) => (
                <article key={title} className="min-h-56 border-b border-r border-[#d0cfc8] p-6">
                  <span className="font-mono text-[9px] text-[#999b93]">0{index + 1}</span>
                  <h3 className="mt-14 text-xl font-medium tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 max-w-md text-[12px] leading-6 text-[#74766e]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#2d302a] text-white">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Come build the calmer way</p><h2 className="mt-5 max-w-2xl text-4xl font-medium tracking-[-0.045em]">We are building ClientFold with the people who feel this problem every week.</h2></div>
            <div className="flex flex-wrap gap-3"><TrackedButtonLink placement="about_final" href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a]">Join early access</TrackedButtonLink><Link href="/contact" className="inline-flex h-11 items-center border border-white/20 px-5 text-xs font-medium hover:bg-white/10">Talk to us</Link></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
