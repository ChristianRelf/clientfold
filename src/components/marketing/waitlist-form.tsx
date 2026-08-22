"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlistAction, type WaitlistState } from "@/app/waitlist/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="mt-2 h-11 w-full bg-[#2d302a] px-5 text-[11px] font-medium text-white transition-colors hover:bg-[#44473f] disabled:opacity-50">{pending ? "Joining…" : "Join the waitlist"}</button>;
}

export function WaitlistForm({ source }: { source?: string }) {
  const [state, action] = useActionState<WaitlistState, FormData>(joinWaitlistAction, undefined);
  if (state?.success) return <div className="border border-[#d1d5ca] bg-[#eef0e9] p-6" role="status"><span className="flex size-8 items-center justify-center rounded-full bg-[#596453] text-sm text-white">✓</span><h2 className="mt-5 text-xl font-medium tracking-tight">You’re on the list.</h2><p className="mt-2 text-[12px] leading-5 text-[#6f716a]">We’ll send early-access details to your inbox when your place is ready.</p><Link href="/" className="mt-6 inline-block text-[10px] font-medium uppercase tracking-[0.12em] text-[#596453]">Back to ClientFold →</Link></div>;

  const inputClass = "mt-1.5 h-10 w-full border border-[#cecdc6] bg-[#fbfbf8] px-3 text-sm outline-none transition-colors placeholder:text-[#a0a199] focus:border-[#737d6c] focus:ring-1 focus:ring-[#737d6c]";
  return <form action={action} className="space-y-4">
    {source ? <input type="hidden" name="source" value={source}/> : null}
    <label className="block"><span className="text-[10px] font-medium text-[#555850]">Your name</span><input className={inputClass} name="name" autoComplete="name" placeholder="Sam Rivera" required/></label>
    <label className="block"><span className="text-[10px] font-medium text-[#555850]">Work email</span><input className={inputClass} name="email" type="email" autoComplete="email" placeholder="you@studio.com" required/></label>
    <label className="block"><span className="text-[10px] font-medium text-[#555850]">Organisation <span className="font-normal text-[#999b93]">· optional</span></span><input className={inputClass} name="organisation" autoComplete="organization" placeholder="Your studio or agency"/></label>
    <label className="block"><span className="text-[10px] font-medium text-[#555850]">How do you work?</span><select className={inputClass} name="workType" defaultValue="" required><option value="" disabled>Select one</option><option value="freelancer">Freelancer</option><option value="studio">Studio</option><option value="agency">Agency</option><option value="consultancy">Consultancy</option><option value="other">Something else</option></select></label>
    {state?.error ? <p className="border border-[#d8c8c1] bg-[#f2e9e4] px-3 py-2 text-[11px] text-[#765c50]">{state.error}</p> : null}
    <SubmitButton/>
    <p className="text-[9px] leading-4 text-[#898b82]">By joining, you agree that ClientFold may contact you about early access. See our <Link href="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.</p>
  </form>;
}
