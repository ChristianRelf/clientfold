"use client";

import { useActionState } from "react";
import { sendContactAction, type ContactState } from "@/app/contact/actions";

export function ContactForm({ initialTopic = "product" }: { initialTopic?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactAction, undefined);
  if (state?.success) return <div className="border border-[#bdc8b7] bg-[#e9efe6] p-6"><p className="text-sm font-medium text-[#3f533b]">Message received.</p><p className="mt-2 text-[12px] leading-6 text-[#5f6d5b]">Thanks for getting in touch. We will reply to the email address you provided.</p></div>;
  const topic = ["product", "support", "billing", "integration", "privacy", "other"].includes(initialTopic) ? initialTopic : "product";
  const fieldClass = "mt-2 h-11 w-full border border-[#cbc9c2] bg-[#fbfaf6] px-3 text-sm outline-none placeholder:text-[#a0a198] focus:border-[#697363] focus:ring-1 focus:ring-[#697363]";
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2"><label className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#666960]">Name<input required name="name" autoComplete="name" className={fieldClass} /></label><label className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#666960]">Email<input required name="email" type="email" autoComplete="email" className={fieldClass} /></label></div>
      <label className="block text-[10px] font-medium uppercase tracking-[0.1em] text-[#666960]">What can we help with?<select name="topic" defaultValue={topic} className={fieldClass}><option value="product">Product question</option><option value="support">Product support</option><option value="billing">Billing and refunds</option><option value="integration">Integration request</option><option value="privacy">Privacy or data</option><option value="other">Something else</option></select></label>
      <label className="hidden" aria-hidden>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      <label className="block text-[10px] font-medium uppercase tracking-[0.1em] text-[#666960]">Message<textarea required name="message" minLength={20} maxLength={5000} rows={7} placeholder="Tell us what you are trying to do and where you got stuck." className={`${fieldClass} h-auto resize-y py-3 leading-6`} /></label>
      {state?.error ? <p role="alert" className="border-l-2 border-[#b9684c] bg-[#f3e9e3] p-3 text-[11px] leading-5 text-[#775343]">{state.error}</p> : null}
      <div className="flex flex-col justify-between gap-4 border-t border-[#d8d7d0] pt-5 sm:flex-row sm:items-center"><p className="max-w-sm text-[10px] leading-5 text-[#85877f]">Please do not include passwords, payment-card details or secure portal links.</p><button disabled={pending} className="inline-flex h-11 items-center justify-center bg-[#2d302a] px-6 text-xs font-medium text-white hover:bg-[#44473f] disabled:cursor-wait disabled:opacity-60">{pending ? "Sending…" : "Send message →"}</button></div>
    </form>
  );
}
