"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FoldMascot } from "@/components/brand/fold-mascot";
import { cn } from "@/lib/utils";
import { fireMarketingEvent } from "./tracked-button-link";

const steps = [
  { label: "Approval requested", detail: "Homepage design v3", state: "done" },
  { label: "Gentle reminder sent", detail: "Autopilot · just now", state: "active" },
  { label: "Sarah approved", detail: "Secure client link", state: "resolved" },
  { label: "Development unlocked", detail: "The project moves again", state: "resolved" },
] as const;

export function AutopilotHero() {
  const [step, setStep] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clearTimers();
    setStep(0);
    fireMarketingEvent("marketing.hero_demo_started", { placement: "homepage_hero" });
    [1, 2, 3].forEach((next, index) => {
      timers.current.push(window.setTimeout(() => {
        setStep(next);
        if (next === 3) fireMarketingEvent("marketing.hero_demo_completed", { placement: "homepage_hero" });
      }, 1050 * (index + 1)));
    });
  }, [clearTimers]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || hasPlayed) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setHasPlayed(true);
      timers.current.push(window.setTimeout(play, 450));
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [clearTimers, hasPlayed, play]);

  return (
    <div ref={rootRef} className="relative overflow-hidden border border-[#c8c9bf] bg-[#f9f8f3] shadow-[0_40px_100px_-56px_rgba(31,34,27,0.7)]">
      <div className="flex h-11 items-center justify-between border-b border-[#deddd5] bg-[#efeee8] px-4 text-[9px] uppercase tracking-[0.12em] text-[#7d7f76]">
        <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#de7044]" /> Live sample</span>
        <span className="flex items-center gap-2">Follow-up Autopilot <FoldMascot pose="resting" size="sm" className="-my-3 hidden sm:block" /></span>
      </div>

      <div className="grid min-h-[430px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative border-b border-[#deddd5] p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#8a8c83]">Waiting on Sarah</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#292c26]">Homepage approval</h2>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-medium transition-colors", step < 2 ? "bg-[#f1dfd5] text-[#995333]" : "bg-[#dce9d7] text-[#4f6549]")}>{step < 2 ? "3 days" : "Approved"}</span>
          </div>

          <div className="mt-8 border-y border-[#dfded7] py-4">
            <div className="flex items-center justify-between text-[10px]"><span className="text-[#85877f]">Project</span><span className="font-medium text-[#3c3f37]">Northstar website</span></div>
            <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-[#85877f]">Version</span><span className="font-medium text-[#3c3f37]">Homepage v3</span></div>
            <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-[#85877f]">Autopilot</span><span className="flex items-center gap-2 font-medium text-[#596453]"><span className="size-1.5 rounded-full bg-[#65a85d]" /> On</span></div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={() => { setHasPlayed(true); play(); }} className="h-10 bg-[#292c26] px-4 text-[10px] font-medium text-white transition-colors hover:bg-[#41453b] focus-visible:ring-offset-[#f9f8f3]">
              {step === 3 ? "Replay follow-up" : "Watch it follow up"}
            </button>
            <span className="text-[9px] leading-4 text-[#8a8c83]">3-day reminder<br />No awkward email</span>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-20 w-20 border-l border-t border-[#dad9d1] bg-[#f3f2ec] sm:block" aria-hidden />
        </div>

        <div className="relative overflow-hidden bg-[#f1f0ea] p-5 sm:p-7">
          <div className="absolute inset-y-0 left-9 w-px bg-[#d2d1c9] sm:left-11" aria-hidden />
          <ol className="relative space-y-3" aria-live="polite" aria-label="Autopilot progress">
            {steps.map((item, index) => {
              const visible = index <= step;
              const isResolved = index >= 2 && visible;
              return (
                <li key={item.label} className={cn("relative grid min-h-[74px] grid-cols-[30px_1fr] items-center gap-4 transition-all duration-500", visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-28")}>
                  <span className={cn("relative z-10 flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-500", isResolved ? "border-[#6fa367] bg-[#6fa367] text-white" : index === step ? "border-[#de7044] bg-[#f8eee8] text-[#a65331]" : "border-[#bfc1b8] bg-[#f7f6f1] text-[#7e8078]")}>{isResolved ? "✓" : index + 1}</span>
                  <div className={cn("border p-3.5 transition-colors duration-500", isResolved ? "border-[#c1d4bb] bg-[#edf4e9]" : index === step ? "border-[#d9b8a7] bg-[#fbf3ee]" : "border-[#d8d7d0] bg-[#f9f8f3]")}>
                    <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-[#34372f]">{item.label}</span>{index === step ? <span className="size-1.5 animate-pulse rounded-full bg-[#de7044]" /> : null}</div>
                    <p className="mt-1 text-[9px] text-[#85877f]">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
