"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const views = [
  { id: "waiting", label: "Waiting room", number: "01" },
  { id: "portal", label: "Client portal", number: "02" },
  { id: "approvals", label: "Approvals", number: "03" },
  { id: "invoices", label: "Invoices", number: "04" },
] as const;

type View = (typeof views)[number]["id"];

function Shell({ children, active }: { children: React.ReactNode; active: View }) {
  return (
    <div className="grid min-h-[500px] grid-cols-[48px_1fr] bg-[#fbfbf8] md:grid-cols-[148px_1fr]">
      <aside className="border-r border-[#dfded8] bg-[#f0efe9] p-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-[#566151] text-[10px] font-semibold text-white">N</div>
        <div className="mt-8 hidden space-y-1 md:block">
          {views.map((view) => (
            <div key={view.id} className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-[10px]", active === view.id ? "bg-white text-[#30332c] shadow-xs" : "text-[#85877f]")}>
              <span className={cn("size-1.5 rounded-full", active === view.id ? "bg-[#65705f]" : "bg-[#c8c8c1]")} />
              {view.label}
            </div>
          ))}
        </div>
      </aside>
      <div className="min-w-0 p-4 sm:p-6">{children}</div>
    </div>
  );
}

function WaitingView() {
  const rows = [
    ["Northstar Ltd", "Homepage design", "Approval", "4 days", "bg-[#e3e7dd] text-[#566151]"],
    ["Atlas Coffee", "Brand assets", "Files", "5 days", "bg-[#e7e4db] text-[#6d6655]"],
    ["Bright Labs", "INV–108", "Payment", "3 days", "bg-[#e9dfd9] text-[#765c50]"],
    ["Northstar Ltd", "Homepage copy", "Task", "2 days", "bg-[#e2e4e5] text-[#596267]"],
  ];
  return (
    <Shell active="waiting">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.14em] text-[#8a8c83]">Friday, 22 August</p><h3 className="mt-1 text-xl font-medium tracking-tight text-[#2d3029]">Waiting room</h3></div>
        <span className="border border-[#dcdbd5] px-2.5 py-1.5 text-[9px] text-[#6c6f66]">7 open items</span>
      </div>
      <div className="mt-6 grid grid-cols-3 border-y border-[#dfded8] py-3">
        {[["£8,420", "Outstanding"], ["2", "Approvals"], ["1", "File request"]].map(([value, label]) => (
          <div key={label} className="border-r border-[#dfded8] px-3 first:pl-0 last:border-0"><div className="text-sm font-semibold text-[#2d3029]">{value}</div><div className="mt-0.5 truncate text-[8px] uppercase tracking-wide text-[#8a8c83]">{label}</div></div>
        ))}
      </div>
      <div className="mt-3 divide-y divide-[#e6e5e0]">
        {rows.map(([client, item, type, time, tone]) => (
          <div key={item} className="grid grid-cols-[1fr_auto] gap-3 py-4 text-[10px] sm:grid-cols-[1fr_1.2fr_auto_auto] sm:items-center">
            <span className="text-[#777970]">{client}</span><span className="hidden font-medium text-[#363931] sm:block">{item}</span><span className={cn("rounded-full px-2 py-1 text-[8px]", tone)}>{type}</span><span className="text-right tabular-nums text-[#777970]">{time}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function PortalView() {
  return (
    <Shell active="portal">
      <div className="flex items-center justify-between border-b border-[#dfded8] pb-4">
        <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-[#dfe4da] text-[10px] font-semibold text-[#596453]">NS</span><div><p className="text-[10px] font-medium text-[#34372f]">Northstar Ltd</p><p className="text-[8px] text-[#8a8c83]">Client workspace</p></div></div>
        <span className="text-[9px] text-[#75776f]">Hi, Sarah</span>
      </div>
      <div className="py-5">
        <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[0.13em] text-[#8a8c83]">Active project</p><h3 className="mt-1 text-lg font-medium text-[#2e312a]">Website redesign</h3></div><span className="text-xs font-medium text-[#596453]">62%</span></div>
        <div className="mt-3 h-1.5 bg-[#e6e5df]"><div className="h-full w-[62%] bg-[#667260]" /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-[#deddd7] bg-white p-4"><p className="text-[8px] uppercase tracking-[0.14em] text-[#8b8d84]">Needs you</p><p className="mt-3 text-xs font-medium text-[#32352e]">Approve homepage design</p><p className="mt-1 text-[9px] text-[#80827a]">Version 3 · Added yesterday</p><button className="mt-4 bg-[#2f332c] px-3 py-2 text-[9px] font-medium text-white">Review design</button></div>
        <div className="border border-[#deddd7] bg-[#f4f3ee] p-4"><p className="text-[8px] uppercase tracking-[0.14em] text-[#8b8d84]">Up next</p><p className="mt-3 text-xs font-medium text-[#32352e]">Development</p><p className="mt-1 text-[9px] leading-4 text-[#80827a]">Starts when the homepage direction is approved.</p></div>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[#e2e1dc] pt-4 text-[9px] text-[#7b7d75]"><span className="size-1.5 rounded-full bg-[#73806b]" /> Latest update: mobile layouts are ready to review</div>
    </Shell>
  );
}

function ApprovalView() {
  return (
    <Shell active="approvals">
      <div className="flex items-center justify-between"><div><p className="text-[9px] text-[#898b82]">Northstar / Website redesign</p><h3 className="mt-1 text-lg font-medium text-[#2e312a]">Homepage design</h3></div><span className="rounded-full bg-[#e3e7dd] px-2.5 py-1 text-[8px] text-[#566151]">In review</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_130px]">
        <div className="border border-[#d9d8d2] bg-[#eae9e3] p-4">
          <div className="mx-auto min-h-[255px] max-w-[340px] bg-[#fafaf7] p-5 shadow-sm">
            <div className="flex items-center justify-between text-[7px] text-[#777970]"><b className="text-[#34372f]">NORTHSTAR</b><span>Platform · Company · Contact</span></div>
            <div className="mx-auto mt-12 max-w-[220px] text-center"><span className="text-[7px] uppercase tracking-[0.15em] text-[#687361]">Technology with direction</span><p className="mt-3 text-2xl font-medium leading-[1.05] tracking-tight text-[#292c26]">Make the complex feel possible.</p><div className="mx-auto mt-5 h-5 w-20 bg-[#31352d]" /></div>
            <div className="mt-10 grid grid-cols-3 gap-1"><span className="h-10 bg-[#dfe4da]" /><span className="h-10 bg-[#e6e1d8]" /><span className="h-10 bg-[#dde1e2]" /></div>
          </div>
        </div>
        <div className="space-y-3"><div className="border border-[#deddd7] bg-white p-3"><p className="text-[8px] text-[#898b82]">Version</p><p className="mt-1 text-[10px] font-medium text-[#353831]">V3 · Current</p></div><div className="border border-[#deddd7] bg-white p-3"><p className="text-[8px] text-[#898b82]">Comments</p><p className="mt-1 text-[10px] font-medium text-[#353831]">2 resolved</p></div><button className="w-full bg-[#596453] px-3 py-2.5 text-[9px] font-medium text-white">Approve version</button><button className="w-full border border-[#d4d3cd] bg-transparent px-3 py-2.5 text-[9px] text-[#686a62]">Request changes</button></div>
      </div>
    </Shell>
  );
}

function InvoicesView() {
  return (
    <Shell active="invoices">
      <div className="flex items-start justify-between"><div><p className="text-[9px] uppercase tracking-[0.13em] text-[#898b82]">Invoice</p><h3 className="mt-1 text-xl font-medium text-[#2e312a]">INV–108</h3></div><span className="rounded-full bg-[#e9dfd9] px-2.5 py-1 text-[8px] text-[#765c50]">Due in 3 days</span></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_190px]">
        <div className="border border-[#deddd7] bg-white p-5"><div className="flex justify-between text-[9px] text-[#85877f]"><span>Billed to<br/><b className="mt-1 inline-block text-[#373a33]">Bright Labs</b></span><span className="text-right">Issued<br/><b className="mt-1 inline-block text-[#373a33]">19 Aug 2026</b></span></div><div className="mt-8 divide-y divide-[#e4e3de] border-y border-[#e4e3de] text-[9px]"><div className="flex justify-between py-3"><span>Brand strategy</span><span>£1,200</span></div><div className="flex justify-between py-3"><span>Identity system</span><span>£1,200</span></div></div><div className="mt-4 flex justify-between text-sm font-semibold text-[#30332c]"><span>Total</span><span>£2,400</span></div></div>
        <div className="bg-[#596453] p-5 text-white"><p className="text-[8px] uppercase tracking-[0.14em] text-white/60">Amount due</p><p className="mt-2 text-2xl font-medium">£2,400</p><button className="mt-8 w-full bg-white px-3 py-2.5 text-[9px] font-medium text-[#30342c]">Pay securely</button><p className="mt-3 text-center text-[8px] text-white/55">Powered by Stripe</p></div>
      </div>
    </Shell>
  );
}

export function ProductTour() {
  const [active, setActive] = useState<View>("waiting");
  return (
    <div className="grid border border-[#cfcec7] bg-[#f7f6f1] lg:grid-cols-[220px_1fr]">
      <div className="border-b border-[#d8d7d0] p-3 lg:border-b-0 lg:border-r lg:p-4">
        <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
          {views.map((view) => <button key={view.id} type="button" onClick={() => setActive(view.id)} aria-pressed={active === view.id} className={cn("flex min-w-max items-center gap-4 px-3 py-3 text-left text-xs transition-colors lg:w-full", active === view.id ? "bg-[#e7e8e1] text-[#30332c]" : "text-[#83857c] hover:bg-[#efeee9] hover:text-[#4f524a]")}><span className="font-mono text-[9px] opacity-60">{view.number}</span><span>{view.label}</span></button>)}
        </div>
        <p className="mt-8 hidden border-t border-[#d8d7d0] pt-4 text-[10px] leading-5 text-[#7b7d75] lg:block">Select a view to explore the workspace.</p>
      </div>
      <div className="min-w-0 p-2 sm:p-3">
        <div className="overflow-hidden border border-[#d7d6cf] shadow-[0_24px_45px_-36px_rgba(46,49,42,.5)]">
          <div className="flex h-9 items-center gap-1.5 border-b border-[#deddd7] bg-[#f8f7f3] px-3"><span className="size-1.5 rounded-full bg-[#c7c7c0]"/><span className="size-1.5 rounded-full bg-[#c7c7c0]"/><span className="size-1.5 rounded-full bg-[#c7c7c0]"/><span className="mx-auto text-[8px] text-[#8a8c83]">app.useclientfold.com</span></div>
          {active === "waiting" && <WaitingView />}{active === "portal" && <PortalView />}{active === "approvals" && <ApprovalView />}{active === "invoices" && <InvoicesView />}
        </div>
      </div>
    </div>
  );
}
