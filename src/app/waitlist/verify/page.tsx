import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { confirmWaitlistEmail, type WaitlistVerificationResult } from "@/lib/waitlist-verification";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

const messages: Record<WaitlistVerificationResult, { eyebrow: string; title: string; body: string }> = {
  verified: {
    eyebrow: "Email confirmed",
    title: "You’re on the list.",
    body: "Your early-access request is confirmed. We’ll be in touch when your place is ready.",
  },
  already_verified: {
    eyebrow: "Already confirmed",
    title: "Your place is secure.",
    body: "This email address is already confirmed for ClientFold early access.",
  },
  expired: {
    eyebrow: "Link expired",
    title: "Let’s send you a fresh link.",
    body: "Verification links last for 24 hours. Return to the waitlist and submit your details again for a new one.",
  },
  invalid: {
    eyebrow: "Link not recognised",
    title: "We couldn’t verify that link.",
    body: "It may be incomplete or replaced by a newer email. Return to the waitlist to request another confirmation link.",
  },
};

export default async function VerifyWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await confirmWaitlistEmail(token) : "invalid";
  const message = messages[result];
  const confirmed = result === "verified" || result === "already_verified";

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main className="flex flex-1 items-center border-b border-[#d9d8d2] py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl border border-[#d5d4cd] bg-[#f8f7f2] shadow-[0_30px_90px_-55px_rgba(40,44,35,0.65)]">
            <div className="flex items-center justify-between border-b border-[#dfded7] px-6 py-5 sm:px-9">
              <span className="text-sm font-semibold tracking-[-0.02em]">ClientFold</span>
              <span className={`flex size-8 items-center justify-center rounded-full text-sm ${confirmed ? "bg-[#596453] text-white" : "bg-[#eee5da] text-[#7b674c]"}`} aria-hidden>
                {confirmed ? "✓" : "!"}
              </span>
            </div>
            <div className="px-6 py-12 sm:px-9 sm:py-16">
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#667060]">{message.eyebrow}</p>
              <h1 className="mt-5 max-w-lg text-balance text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">{message.title}</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#696c64]">{message.body}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={confirmed ? "/demo" : "/waitlist"} className="inline-flex h-11 items-center bg-[#2d302a] px-5 text-xs font-medium text-white transition-colors hover:bg-[#44473f]">
                  {confirmed ? "Explore the demo" : "Return to the waitlist"} <span className="ml-3" aria-hidden>→</span>
                </Link>
                <Link href="/" className="inline-flex h-11 items-center border border-[#cecdc6] px-5 text-xs font-medium transition-colors hover:bg-[#efeee8]">Back to ClientFold</Link>
              </div>
            </div>
            <div className="bg-[#282b24] px-6 py-5 text-[#f3f2ed] sm:px-9">
              <p className="text-xs font-medium">Client work. Without the chase.</p>
              <p className="mt-1 text-[9px] text-white/45">Approvals, files, invoices and thoughtful follow-ups in one calm place.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
