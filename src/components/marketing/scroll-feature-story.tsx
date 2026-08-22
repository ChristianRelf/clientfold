"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "approvals",
    number: "01",
    eyebrow: "Approvals",
    title: "Feedback becomes a decision.",
    body: "Share a version, collect pinned comments and capture a clear, timestamped sign-off.",
  },
  {
    id: "files",
    number: "02",
    eyebrow: "File requests",
    title: "Ask for exactly what is missing.",
    body: "Clients see a simple checklist and drop files directly into the right project context.",
  },
  {
    id: "invoices",
    number: "03",
    eyebrow: "Invoices",
    title: "Payment stays attached to the work.",
    body: "Send an invoice from the project and let its status surface automatically in the Waiting Room.",
  },
  {
    id: "portal",
    number: "04",
    eyebrow: "Client portal",
    title: "Your client always knows what comes next.",
    body: "One branded link shows progress, recent updates and the next action—without exposing internal clutter.",
  },
] as const;

type FeatureId = (typeof features)[number]["id"];

function ApprovalScene() {
  return (
    <div className="grid h-full grid-cols-[1fr_122px] gap-3 p-4 sm:p-6">
      <div className="flex items-center justify-center bg-[#e8e7e1] p-5">
        <div className="relative aspect-[4/3] w-full max-w-sm bg-[#fafaf7] p-6 shadow-sm">
          <div className="flex items-center justify-between text-[7px] text-[#85877f]"><b className="text-[#34372f]">NORTHSTAR</b><span>Platform · Company</span></div>
          <div className="mx-auto mt-10 max-w-[220px] text-center"><span className="text-[7px] uppercase tracking-[0.16em] text-[#64705e]">Technology with direction</span><p className="mt-3 text-xl font-medium leading-tight tracking-tight">Make the complex feel possible.</p><span className="mx-auto mt-4 block h-4 w-16 bg-[#34382f]" /></div>
          <span className="absolute right-[19%] top-[41%] flex size-5 items-center justify-center rounded-full bg-[#64705e] text-[8px] text-white shadow-md">1</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="border border-[#deddd7] bg-white p-3"><p className="text-[8px] text-[#8a8c83]">Current</p><p className="mt-1 text-[10px] font-medium">Version 3</p></div>
        <div className="border border-[#deddd7] bg-white p-3"><p className="text-[8px] text-[#8a8c83]">Comments</p><p className="mt-1 text-[10px] font-medium">2 resolved</p></div>
        <div className="bg-[#596453] p-3 text-center text-[9px] font-medium text-white">Approve</div>
      </div>
    </div>
  );
}

function FilesScene() {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md border border-[#d9d8d2] bg-white p-5">
        <div className="flex items-start justify-between"><div><p className="text-[8px] uppercase tracking-[0.14em] text-[#898b82]">File request</p><p className="mt-2 text-sm font-medium">Brand assets</p></div><span className="rounded-full bg-[#e8e5dc] px-2 py-1 text-[8px] text-[#6d6655]">2 of 3</span></div>
        <div className="mt-5 space-y-2">
          {["Primary logo · SVG", "Brand guidelines · PDF", "Team photography"].map((file, index) => <div key={file} className="flex items-center gap-3 border border-[#e2e1dc] p-3 text-[9px]"><span className={cn("flex size-4 items-center justify-center rounded-full", index < 2 ? "bg-[#64705e] text-white" : "border border-[#c4c5bd] text-transparent")}>✓</span><span className={index < 2 ? "text-[#41443d]" : "text-[#898b82]"}>{file}</span><span className="ml-auto text-[8px] text-[#a0a199]">{index < 2 ? "Added" : "Needed"}</span></div>)}
        </div>
        <div className="mt-3 border border-dashed border-[#c9c8c1] bg-[#f5f4ef] p-5 text-center text-[9px] text-[#7d7f77]">Drop files here or choose from your device</div>
      </div>
    </div>
  );
}

function InvoiceScene() {
  return (
    <div className="grid h-full gap-4 p-5 sm:grid-cols-[1fr_180px] sm:p-8">
      <div className="border border-[#dddcd6] bg-white p-5"><div className="flex justify-between text-[8px] text-[#898b82]"><span>INVOICE<br/><b className="mt-1 inline-block text-xs text-[#34372f]">INV–108</b></span><span className="text-right">BRIGHT LABS<br/><b className="mt-1 inline-block text-[#34372f]">Due 25 Aug</b></span></div><div className="mt-8 divide-y divide-[#e5e4df] border-y border-[#e5e4df] text-[9px]"><div className="flex justify-between py-3"><span>Brand strategy</span><span>£1,200</span></div><div className="flex justify-between py-3"><span>Identity system</span><span>£1,200</span></div></div><div className="mt-4 flex justify-between text-sm font-medium"><span>Total</span><span>£2,400</span></div></div>
      <div className="flex flex-col justify-between bg-[#596453] p-5 text-white"><div><p className="text-[8px] uppercase tracking-[0.14em] text-white/55">Status</p><p className="mt-2 text-sm font-medium">Awaiting payment</p></div><div><p className="text-2xl font-medium">£2,400</p><div className="mt-4 bg-white px-3 py-2 text-center text-[9px] text-[#353930]">Pay securely</div></div></div>
    </div>
  );
}

function PortalScene() {
  return (
    <div className="h-full p-5 sm:p-8">
      <div className="flex items-center justify-between border-b border-[#deddd7] pb-4"><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-[#dfe4da] text-[9px] font-semibold text-[#596453]">NS</span><div><p className="text-[10px] font-medium">Northstar Ltd</p><p className="text-[8px] text-[#8a8c83]">Client workspace</p></div></div><span className="text-[8px] text-[#85877f]">Hi, Sarah</span></div>
      <div className="mt-6 flex items-end justify-between"><div><p className="text-[8px] uppercase tracking-[0.14em] text-[#898b82]">Active project</p><p className="mt-2 text-lg font-medium">Website redesign</p></div><span className="text-xs font-medium text-[#596453]">62%</span></div>
      <div className="mt-3 h-1.5 bg-[#e5e4df]"><div className="h-full w-[62%] bg-[#64705e]" /></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="border border-[#ddddd6] bg-white p-4"><p className="text-[8px] uppercase tracking-[0.14em] text-[#898b82]">Needs you</p><p className="mt-3 text-xs font-medium">Approve homepage design</p><p className="mt-1 text-[8px] text-[#85877f]">Version 3 · Added yesterday</p></div><div className="border border-[#ddddd6] bg-[#f0efe9] p-4"><p className="text-[8px] uppercase tracking-[0.14em] text-[#898b82]">Up next</p><p className="mt-3 text-xs font-medium">Development</p><p className="mt-1 text-[8px] text-[#85877f]">Ready after approval</p></div></div>
    </div>
  );
}

function ProductScene({ active }: { active: FeatureId }) {
  return (
    <div className="overflow-hidden border border-[#d2d1ca] bg-[#fbfbf8] shadow-[0_30px_70px_-45px_rgba(38,41,34,.55)]">
      <div className="flex h-10 items-center gap-1.5 border-b border-[#deddd7] bg-[#f4f3ee] px-3"><span className="size-1.5 rounded-full bg-[#c5c6bf]"/><span className="size-1.5 rounded-full bg-[#c5c6bf]"/><span className="size-1.5 rounded-full bg-[#c5c6bf]"/><span className="mx-auto text-[8px] text-[#8b8d84]">clientfold.com / northstar</span></div>
      <div key={active} className="h-[410px] animate-scale-in bg-[#f7f6f1] sm:h-[470px]">
        {active === "approvals" && <ApprovalScene />}{active === "files" && <FilesScene />}{active === "invoices" && <InvoiceScene />}{active === "portal" && <PortalScene />}
      </div>
    </div>
  );
}

export function ScrollFeatureStory() {
  const [active, setActive] = useState<FeatureId>("approvals");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.getAttribute("data-feature") as FeatureId);
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-18% 0px -32% 0px" },
    );
    Object.values(refs.current).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]">
      <div className="container grid gap-10 py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:py-28">
        <div>
          <div className="lg:sticky lg:top-28">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Watch the work move</p><h2 className="mt-4 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl">The interface changes as the project does.</h2>
            <div className="mt-10 hidden lg:block"><ProductScene active={active} /></div>
          </div>
        </div>
        <div className="border-t border-[#d6d5ce]">
          <div className="my-8 lg:hidden"><ProductScene active={active} /></div>
          {features.map((feature) => (
            <article key={feature.id} ref={(node) => { refs.current[feature.id] = node; }} data-feature={feature.id} className={cn("flex min-h-[48vh] flex-col justify-center border-b border-[#d6d5ce] py-14 transition-opacity duration-500 lg:min-h-[58vh] lg:px-4", active === feature.id ? "opacity-100" : "opacity-45")}>
              <div className="flex items-center gap-4"><span className="font-mono text-[9px] text-[#999b93]">{feature.number}</span><span className="text-[9px] uppercase tracking-[0.15em] text-[#667160]">{feature.eyebrow}</span></div>
              <h3 className="mt-6 max-w-lg text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{feature.title}</h3><p className="mt-4 max-w-md text-sm leading-6 text-[#74766e]">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
