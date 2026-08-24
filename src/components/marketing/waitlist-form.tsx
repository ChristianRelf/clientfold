"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { joinWaitlistAction, type WaitlistState } from "@/app/waitlist/actions";
import { fireMarketingEvent } from "./tracked-button-link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group mt-2 flex h-12 w-full items-center justify-between bg-[#2d302a] px-5 text-[11px] font-medium text-white transition-colors hover:bg-[#44473f] disabled:cursor-wait disabled:opacity-60"
    >
      <span>{pending ? "Joining…" : "Join early access"}</span>
      <span className={`text-base transition-transform ${pending ? "animate-pulse" : "group-hover:translate-x-1"}`} aria-hidden>
        {pending ? "·" : "→"}
      </span>
    </button>
  );
}

export function WaitlistForm({ source, referral }: { source?: string; referral?: string }) {
  const [state, action] = useActionState<WaitlistState, FormData>(joinWaitlistAction, undefined);
  const started = useRef(false);

  if (state?.status) {
    const alreadyVerified = state.status === "already_verified";
    return (
      <div className="border border-[#cdd5c8] bg-[#eef2ea] p-6" role="status" aria-live="polite">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#596453] text-sm text-white">✓</span>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.03em]">
          {alreadyVerified ? "You’re already confirmed." : "Check your inbox."}
        </h2>
        <p className="mt-3 text-[12px] leading-6 text-[#656a61]">
          {alreadyVerified
            ? "Your place on the ClientFold waitlist is confirmed. We’ll be in touch when early access is ready."
            : <>We sent a confirmation link to <strong className="font-medium text-[#42473f]">{state.email}</strong>. Open it within 24 hours to secure your place.</>}
        </p>
        {!alreadyVerified ? <p className="mt-3 text-[10px] leading-5 text-[#7d8178]">It may take a minute to arrive. Check your spam folder if you don’t see it.</p> : null}
        <Link href="/demo" className="mt-7 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#596453] hover:text-[#394235]">
          Explore the interactive demo <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  // Keep controls at 16px on phones so iOS Safari does not zoom the page when
  // an input receives focus. Desktop can use the denser marketing scale.
  const inputClass = "mt-2 h-11 w-full border border-[#cecdc6] bg-white px-3.5 text-base text-[#30332c] outline-none transition placeholder:text-[#a2a39c] hover:border-[#aaaca4] focus:border-[#667260] focus:ring-2 focus:ring-[#667260]/15 sm:text-[13px]";

  return (
    <form
      action={action}
      className="space-y-4"
      onFocusCapture={() => {
        if (!started.current) {
          started.current = true;
          fireMarketingEvent("waitlist.started", { page: location.pathname });
        }
      }}
    >
      {source ? <input type="hidden" name="source" value={source} /> : null}
      {referral ? <input type="hidden" name="ref" value={referral} /> : null}

      <label className="block">
        <span className="text-[10px] font-medium text-[#555850]">Your name</span>
        <input className={inputClass} name="name" autoComplete="name" placeholder="Sam Rivera" required />
      </label>

      <label className="block">
        <span className="text-[10px] font-medium text-[#555850]">Work email</span>
        <input className={inputClass} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@studio.com" required />
      </label>

      <label className="block">
        <span className="text-[10px] font-medium text-[#555850]">How do you work?</span>
        <select className={`${inputClass} cursor-pointer`} name="workType" defaultValue="" required>
          <option value="" disabled>Select one</option>
          <option value="freelancer">Freelancer</option>
          <option value="studio">Studio</option>
          <option value="agency">Agency</option>
          <option value="consultancy">Consultancy</option>
          <option value="other">Something else</option>
        </select>
      </label>

      {state?.error ? (
        <p className="border border-[#d8c8c1] bg-[#f2e9e4] px-3 py-2 text-[11px] text-[#765c50]" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
      <p className="text-[9px] leading-4 text-[#898b82]">
        By joining, you agree that ClientFold may contact you about early access. No spam. See our{" "}
        <Link href="/privacy" className="underline decoration-[#babbb4] underline-offset-2 hover:text-[#4a4d46]">Privacy Notice</Link>.
      </p>
    </form>
  );
}
