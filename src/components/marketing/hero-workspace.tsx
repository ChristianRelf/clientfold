"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type View = "studio" | "client";

export function HeroWorkspace() {
  const [view, setView] = useState<View>("studio");
  const [approved, setApproved] = useState(false);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="hero-workspace relative overflow-hidden rounded-2xl border border-[#bfc1b7] bg-[#fbfbf7] shadow-[0_42px_100px_-52px_rgba(35,39,31,0.78)]">
        <div className="hero-glow absolute -right-24 -top-24 size-72 rounded-full bg-[#dfe4da] opacity-70 blur-3xl" aria-hidden />
        <div className="relative flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-[#d4d4cc] bg-[#efeee8]/90 px-4">
          <span className="text-[9px] uppercase tracking-[0.12em] text-[#666a61]">Northstar / Website redesign</span>
          <div className="flex items-center gap-1 rounded-lg border border-[#d2d2ca] bg-[#f8f7f2] p-1" aria-label="Switch product view">
            <button type="button" onClick={() => setView("studio")} className={cn("rounded-md px-3 py-1.5 text-[9px] font-medium transition-colors", view === "studio" ? "bg-[#2d302a] text-white" : "text-[#777970] hover:text-[#34372f]")}>Studio view</button>
            <button type="button" onClick={() => setView("client")} className={cn("rounded-md px-3 py-1.5 text-[9px] font-medium transition-colors", view === "client" ? "bg-[#2d302a] text-white" : "text-[#777970] hover:text-[#34372f]")}>Client view</button>
          </div>
        </div>

        {view === "studio" ? (
          <div className="relative grid min-h-[410px] sm:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-[#deddd5] p-5 sm:border-b-0 sm:border-r sm:p-7">
              <div className="hero-action-card flex h-full flex-col rounded-xl border border-[#d4d4cc] bg-[#fffefa] p-5 shadow-[0_24px_50px_-36px_rgba(38,41,34,.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">{approved ? "Moved forward" : "Needs Sarah"}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#292c26]">Homepage design v3</h2></div>
                  <span className={cn("hero-status rounded-full px-2.5 py-1 text-[9px] font-medium", approved ? "bg-[#e2eadf] text-[#52684b]" : "bg-[#f1dfd5] text-[#995333]")}>{approved ? "Approved" : "Awaiting"}</span>
                </div>
                <div className="mt-7 space-y-3 border-y border-[#e1e0da] py-4 text-[10px]">
                  <div className="flex justify-between"><span className="text-[#85877f]">Project</span><span className="font-medium text-[#3c3f37]">Northstar website</span></div>
                  <div className="flex justify-between"><span className="text-[#85877f]">Follow-up</span><span className="flex items-center gap-2 font-medium text-[#596453]"><span className="size-1.5 rounded-full bg-[#6e9a63]" /> {approved ? "Stopped automatically" : "Autopilot on"}</span></div>
                </div>
                <div className="mt-auto pt-6" aria-live="polite">
                  {approved ? <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#e7efe3] px-3 py-2.5 text-[9px] font-medium text-[#52684b]"><span className="grid size-5 place-items-center rounded-full bg-[#6f9565] text-white">✓</span> Approved - development unlocked</div> : <p className="mb-3 text-[9px] leading-4 text-[#7d7f76]">See the exact one-click experience your client receives.</p>}
                  <button type="button" onClick={() => setView("client")} className="w-full bg-[#2d302a] px-4 py-3 text-left text-[10px] font-medium text-white transition-colors hover:bg-[#42463d]">{approved ? "Replay the client view" : "Open Sarah’s approval"} <span className="float-right">→</span></button>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#f0f1e9] p-5 sm:p-7">
              <div className="absolute bottom-0 left-9 top-0 w-px bg-[#d0d3c8]" aria-hidden />
              <p className="relative z-10 text-[9px] uppercase tracking-[0.15em] text-[#7d8077]">Project momentum</p>
              <ol className="relative z-10 mt-7 space-y-4">
                {[
                  ["Approval requested", "Monday · 10:14", "quiet"],
                  ["Gentle reminder sent", "Thursday · 10:00", "warm"],
                  [approved ? "Homepage approved" : "Waiting for Sarah", approved ? "Just now" : "Autopilot is watching", approved ? "done" : "quiet"],
                ].map(([label, detail, tone], index) => (
                  <li key={label} className="grid grid-cols-[28px_1fr] items-center gap-3">
                    <span className={cn("grid size-7 place-items-center rounded-full border text-[9px] font-semibold", tone === "done" ? "border-[#6f9565] bg-[#6f9565] text-white" : tone === "warm" ? "border-[#de7044] bg-[#fbefe9] text-[#a65331]" : "border-[#c4c7bd] bg-[#f8f7f2] text-[#7c7e76]")}>{tone === "done" ? "✓" : index + 1}</span>
                    <div className="rounded-lg border border-[#d8d9d1] bg-[#fbfbf7] p-3"><p className="text-[10px] font-medium text-[#34372f]">{label}</p><p className="mt-1 text-[8px] text-[#85877f]">{detail}</p></div>
                  </li>
                ))}
              </ol>
              <div className="relative z-10 mt-5 border-l-2 border-[#718069] bg-[#e5e9df] p-3"><p className="text-[8px] uppercase tracking-[0.13em] text-[#718069]">Up next</p><p className="mt-1 text-[10px] font-medium text-[#34372f]">{approved ? "Development begins" : "Approval unlocks development"}</p></div>
            </div>
          </div>
        ) : (
          <div className="relative min-h-[410px] bg-[#e9e9e2] p-5 sm:p-8">
            <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-[#d1d1c9] bg-[#fbfbf7] shadow-[0_26px_55px_-34px_rgba(35,39,31,.7)]">
              <div className="flex items-center justify-between border-b border-[#deddd6] px-5 py-4"><div><p className="text-[10px] font-semibold text-[#34372f]">Northstar Ltd</p><p className="mt-1 text-[8px] text-[#85877f]">A portal by Northline Studio</p></div><span className="rounded-full bg-[#e8ebdf] px-2 py-1 text-[8px] text-[#62705c]">Secure link</span></div>
              <div className="p-5 sm:p-7">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Good afternoon, Sarah</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#292c26]">{approved ? "You’re all caught up." : "One thing needs you."}</h2>
                <div className="mt-6 rounded-lg border border-[#d1d5ca] bg-[#eef1eb] p-4">
                  <div className="flex justify-between gap-4"><span className="text-[9px] uppercase tracking-[0.13em] text-[#697363]">Approval</span><span className="text-[9px] text-[#777970]">Homepage · v3</span></div>
                  <p className="mt-6 text-sm font-medium text-[#30332c]">Homepage design is ready</p>
                  <p className="mt-2 text-[9px] leading-4 text-[#777970]">Review the latest version and record your decision. No account or password needed.</p>
                  <button type="button" disabled={approved} onClick={() => setApproved(true)} className="mt-5 w-full rounded-md bg-[#30332c] px-4 py-3 text-[10px] font-medium text-white transition-all hover:bg-[#464a40] disabled:bg-[#dfe6dc] disabled:text-[#52684b]">{approved ? "Approved - project unblocked ✓" : "Approve homepage"}</button>
                </div>
                <button type="button" onClick={() => setView("studio")} className="mt-5 w-full text-center text-[9px] font-medium text-[#596453]">See what changed in the studio →</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 text-center text-[10px] uppercase tracking-[0.13em] text-[#7d7f76]"><span className="size-1.5 rounded-full bg-[#de7044]" /> Interactive product preview - try both views</div>
    </div>
  );
}
