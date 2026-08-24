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
    id: "messages",
    number: "04",
    eyebrow: "Messaging",
    title: "The conversation stays with the work.",
    body: "Clients ask, you reply and every decision stays in one calm thread instead of disappearing into email.",
  },
  {
    id: "portal",
    number: "05",
    eyebrow: "Client portal",
    title: "Your client always knows what comes next.",
    body: "One branded link shows progress, recent updates and the next action-without exposing internal clutter.",
  },
  {
    id: "integrations",
    number: "06",
    eyebrow: "Integrations",
    title: "Your other tools stay in the loop.",
    body: "Bring in reviewed marketplace work, take payments through Stripe and send signed events to the systems you already use.",
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

function MessagingScene() {
  return (
    <div className="flex h-full items-center justify-center bg-[#ebeae4] p-4 sm:p-7" aria-label="Animated conversation between a client and Northline Studio">
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#d1d1ca] bg-[#fbfbf7] shadow-[0_22px_50px_-34px_rgba(35,39,31,.6)]">
        <div className="flex items-center gap-3 border-b border-[#deddd6] px-4 py-3">
          <span className="relative grid size-8 place-items-center rounded-full bg-[#e2e6dd] text-[9px] font-semibold text-[#596453]">SW<span className="absolute bottom-0 right-0 size-2 rounded-full border-2 border-[#fbfbf7] bg-[#6f9565]" /></span>
          <div><p className="text-[10px] font-medium text-[#34372f]">Sarah Whitfield</p><p className="mt-0.5 text-[8px] text-[#8a8c83]">Northstar Ltd · Client</p></div>
          <span className="ml-auto rounded-full bg-[#edf0e9] px-2 py-1 text-[8px] text-[#63705d]">Homepage v4</span>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#f4f3ee] px-4 py-5 sm:px-6">
          <p className="text-center text-[7px] uppercase tracking-[0.14em] text-[#9a9c94]">Today · Project conversation</p>
          <div className="mt-5 space-y-4">
            <div className="showcase-message showcase-message--one flex items-end gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e2e6dd] text-[7px] font-semibold text-[#596453]">SW</span>
              <div className="max-w-[78%]"><div className="rounded-[14px_14px_14px_3px] border border-[#dad9d2] bg-white px-4 py-3 text-[10px] leading-4 text-[#4b4e46]">Could we make the opening line feel a little warmer?</div><p className="mt-1 pl-1 text-[7px] text-[#9a9c94]">Sarah · 10:14</p></div>
            </div>

            <div className="showcase-message showcase-message--two flex items-end justify-end gap-2">
              <div className="max-w-[78%] text-right"><div className="rounded-[14px_14px_3px_14px] bg-[#596453] px-4 py-3 text-left text-[10px] leading-4 text-white">Absolutely - I’ve added a softer option to v4. It’s ready above.</div><p className="mt-1 pr-1 text-[7px] text-[#9a9c94]">You · 10:18 · Read</p></div>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#30342d] text-[7px] font-semibold text-white">NL</span>
            </div>

            <div className="showcase-typing flex items-end gap-2" aria-hidden>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e2e6dd] text-[7px] font-semibold text-[#596453]">SW</span>
              <div className="flex h-8 items-center gap-1 rounded-[12px_12px_12px_3px] border border-[#dad9d2] bg-white px-3"><span className="showcase-typing-dot size-1 rounded-full bg-[#9a9c94]" /><span className="showcase-typing-dot size-1 rounded-full bg-[#9a9c94]" /><span className="showcase-typing-dot size-1 rounded-full bg-[#9a9c94]" /></div>
            </div>

            <div className="showcase-message showcase-message--three flex items-end gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e2e6dd] text-[7px] font-semibold text-[#596453]">SW</span>
              <div className="max-w-[78%]"><div className="rounded-[14px_14px_14px_3px] border border-[#cbd4c6] bg-[#edf1e9] px-4 py-3 text-[10px] leading-4 text-[#465040]">That’s it - approved. Thank you!</div><p className="mt-1 pl-1 text-[7px] text-[#9a9c94]">Sarah · Just now</p></div>
            </div>
          </div>
          <div className="showcase-message showcase-message--outcome absolute inset-x-4 bottom-3 flex items-center gap-2 border-l-2 border-[#718069] bg-[#e3e9df] px-3 py-2 text-[8px] font-medium text-[#52604d] sm:inset-x-6"><span className="grid size-4 place-items-center rounded-full bg-[#6f9565] text-[7px] text-white">✓</span> Approval recorded · Development unblocked</div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#deddd6] bg-white px-4 py-3"><span className="flex-1 rounded-lg border border-[#deddd6] bg-[#faf9f5] px-3 py-2 text-[8px] text-[#a0a199]">Reply to Sarah…</span><span className="grid size-8 place-items-center rounded-lg bg-[#30342d] text-[10px] text-white">↑</span></div>
      </div>
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

const integrationItems = [
  { name: "Fiverr", logo: "/integrations/fiverr.svg", status: "Reviewed import", side: "in" },
  { name: "Upwork", logo: "/integrations/upwork.svg", status: "Reviewed import", side: "in" },
  { name: "Stripe", logo: "/integrations/stripe.svg", status: "Connected", side: "out" },
  { name: "Webhooks", logo: null, status: "Connected", side: "out" },
] as const;

function IntegrationTile({ item }: { item: (typeof integrationItems)[number] }) {
  return <div className="flex items-center gap-2.5 rounded-lg border border-[#d7d6cf] bg-white p-2.5 shadow-[0_8px_22px_-18px_rgba(35,39,31,.5)]">
    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#e1e0da] bg-[#fbfbf7] p-1.5">
      {item.logo ? <img src={item.logo} alt="" aria-hidden className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] font-semibold text-[#596453]">{'{}'}</span>}
    </span>
    <span className="min-w-0"><span className="block truncate text-[9px] font-medium text-[#3e4139]">{item.name}</span><span className="mt-0.5 block text-[7px] text-[#8d8f87]">{item.status}</span></span>
    <span className={cn("ml-auto size-1.5 shrink-0 rounded-full", item.status === "Connected" ? "bg-[#6f9565]" : "bg-[#de7044]")} />
  </div>;
}

function IntegrationsScene() {
  const incoming = integrationItems.filter((item) => item.side === "in");
  const outgoing = integrationItems.filter((item) => item.side === "out");
  return (
    <div className="relative h-full overflow-hidden bg-[#ebeae4] p-4 sm:p-6" aria-label="ClientFold integration flow">
      <div className="flex items-center justify-between"><div><p className="text-[8px] uppercase tracking-[0.14em] text-[#8b8d84]">Connected workflow</p><p className="mt-1 text-[11px] font-medium text-[#3d4038]">Northline Studio</p></div><span className="rounded-full border border-[#d1d4cb] bg-[#f5f6f1] px-2.5 py-1 text-[7px] text-[#60705b]">2 live · 2 reviewed imports</span></div>

      <div className="relative mt-5 grid grid-cols-[1fr_0.92fr_1fr] items-center gap-3 sm:gap-5">
        <div className="space-y-2"><p className="mb-3 text-[7px] uppercase tracking-[0.14em] text-[#96988f]">Work comes in</p>{incoming.map((item) => <IntegrationTile key={item.name} item={item} />)}</div>

        <div className="relative z-10 flex min-h-44 flex-col items-center justify-center rounded-xl border border-[#c9cec3] bg-[#f6f7f2] p-3 text-center shadow-[0_18px_35px_-26px_rgba(35,39,31,.75)]">
          <span className="grid size-10 place-items-center rounded-xl bg-[#596453] text-sm font-semibold text-white shadow-sm">C</span>
          <p className="mt-3 text-[10px] font-semibold text-[#363a32]">ClientFold</p>
          <p className="mt-1 text-[7px] leading-3 text-[#85877f]">Northstar website<br/>Project record</p>
          <span className="integration-hub-pulse absolute inset-3 rounded-lg border border-[#778371]/20" aria-hidden />
        </div>

        <div className="space-y-2"><p className="mb-3 text-right text-[7px] uppercase tracking-[0.14em] text-[#96988f]">Updates go out</p>{outgoing.map((item) => <IntegrationTile key={item.name} item={item} />)}</div>

        <div className="pointer-events-none absolute left-[27%] right-[27%] top-1/2 -z-0 h-px bg-[#bfc3b9]" aria-hidden><span className="integration-flow-dot absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#de7044] shadow-[0_0_0_4px_rgba(222,112,68,.12)]" /></div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#d5d4cd] bg-[#fbfbf7]">
        {[
          ["Fiverr", "Order metadata reviewed and added", "Import"],
          ["Stripe", "INV-108 paid · Waiting item cleared", "Live"],
          ["Webhook", "invoice.paid delivered · 200 OK", "Live"],
        ].map(([source, event, status], index) => <div key={source} className={cn("integration-event flex items-center gap-3 border-b border-[#e3e2dc] px-3 py-2.5 last:border-0", `integration-event--${index + 1}`)}><span className="grid size-5 place-items-center rounded-full bg-[#e6e9e1] text-[7px] font-semibold text-[#596453]">{index + 1}</span><span className="min-w-0 flex-1"><span className="block text-[8px] font-medium text-[#45483f]">{event}</span><span className="mt-0.5 block text-[7px] text-[#979990]">via {source}</span></span><span className="text-[7px] font-medium text-[#65715f]">{status}</span></div>)}
      </div>

      <p className="mt-3 text-center text-[7px] text-[#8d8f87]">Drive, Dropbox, Slack and Discord are clearly marked coming soon in the catalogue.</p>
    </div>
  );
}

function ProductScene({ active, onSelect }: { active: FeatureId; onSelect?: (id: FeatureId) => void }) {
  const activeIndex = features.findIndex((feature) => feature.id === active);
  const current = features[activeIndex];
  return (
    <div className="overflow-hidden rounded-xl border border-[#c5c6bd] bg-[#fbfbf8] shadow-[0_34px_80px_-45px_rgba(38,41,34,.68)]">
      <div className="flex min-h-12 items-center gap-2 border-b border-[#d8d7d0] bg-[#efeee8] px-4">
        <span className="grid size-6 place-items-center rounded-md bg-[#596453] text-[8px] font-semibold text-white">N</span>
        <div><p className="text-[9px] font-medium text-[#3f423a]">Northline Studio</p><p className="text-[7px] text-[#92948b]">Northstar website</p></div>
        <span className="ml-auto flex items-center gap-2 text-[8px] text-[#777a71]"><span className="size-1.5 rounded-full bg-[#de7044]" /> Live preview</span>
      </div>
      <div key={active} className="showcase-scene h-[410px] bg-[#f7f6f1] sm:h-[490px]">
        {active === "approvals" && <ApprovalScene />}{active === "files" && <FilesScene />}{active === "invoices" && <InvoiceScene />}{active === "messages" && <MessagingScene />}{active === "portal" && <PortalScene />}{active === "integrations" && <IntegrationsScene />}
      </div>
      <div className="flex min-h-14 items-center justify-between gap-4 border-t border-[#d8d7d0] bg-[#fbfbf7] px-4">
        <div><p className="text-[7px] uppercase tracking-[0.14em] text-[#999b93]">Now showing</p><p className="mt-0.5 text-[9px] font-medium text-[#4a4e45]">{current.eyebrow}</p></div>
        <div className="flex items-center gap-2" aria-label="Showcase chapters">
          {features.map((feature, index) => <button key={feature.id} type="button" onClick={() => onSelect?.(feature.id)} aria-label={`Show ${feature.eyebrow}`} aria-current={active === feature.id ? "step" : undefined} className={cn("h-1.5 rounded-full transition-all duration-300", active === feature.id ? "w-8 bg-[#65715f]" : "w-3 bg-[#d2d2cb] hover:bg-[#aeb1a7]")}><span className="sr-only">{index + 1}</span></button>)}
        </div>
        <p className="font-mono text-[8px] text-[#8c8e85]">{String(activeIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}</p>
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

  function selectFeature(id: FeatureId) {
    setActive(id);
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const activeIndex = features.findIndex((feature) => feature.id === active);

  return (
    <section className="overflow-clip border-b border-[#d9d8d2] bg-[#f3f2ed]">
      <div className="container border-b border-[#d5d4cd] py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.62fr_1.38fr] lg:items-end">
          <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Watch the work move</p><p className="mt-4 max-w-xs text-xs leading-5 text-[#777970]">Scroll through a real client loop. The product changes with every action.</p></div>
          <h2 className="max-w-3xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">Six connected moments. <span className="font-editorial font-normal italic text-[#5d6857]">One project suddenly moving again.</span></h2>
        </div>
      </div>
      <div className="container grid gap-12 pb-20 lg:grid-cols-[0.58fr_1.42fr] lg:gap-16 lg:pb-28">
        <div className="relative border-l border-[#d0cfc8]">
          <span className="absolute left-[-1px] top-0 hidden w-0.5 bg-[#de7044] transition-all duration-500 lg:block" style={{ height: `${100 / features.length}%`, transform: `translateY(${activeIndex * 100}%)` }} aria-hidden />
          {features.map((feature) => (
            <article key={feature.id} ref={(node) => { refs.current[feature.id] = node; }} data-feature={feature.id} className={cn("flex min-h-[62vh] flex-col justify-center border-b border-[#d6d5ce] py-14 pl-6 transition-all duration-500 sm:pl-10 lg:min-h-[72vh] lg:pr-6", active === feature.id ? "opacity-100" : "opacity-40")}>
              <button type="button" onClick={() => selectFeature(feature.id)} className="text-left">
                <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-4"><span className="font-mono text-[9px] text-[#999b93]">{feature.number}</span><span className="text-[9px] uppercase tracking-[0.15em] text-[#667160]">{feature.eyebrow}</span></span>{active === feature.id ? <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.13em] text-[#8a5a42]"><span className="size-1.5 rounded-full bg-[#de7044]" /> In view</span> : null}</div>
                <h3 className="mt-6 max-w-md text-3xl font-medium leading-tight tracking-[-0.035em]">{feature.title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-[#74766e]">{feature.body}</p>
                <span className={cn("mt-7 inline-flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.12em] text-[#596453] transition-opacity", active === feature.id ? "opacity-100" : "opacity-0")}>See it in the product <span aria-hidden>→</span></span>
              </button>
              <div className="mt-8 lg:hidden"><ProductScene active={feature.id} /></div>
            </article>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 pt-14">
            <ProductScene active={active} onSelect={selectFeature} />
            <div className="mt-4 flex items-center justify-between text-[8px] uppercase tracking-[0.13em] text-[#8b8d84]"><span>Scroll to keep exploring</span><span className="flex items-center gap-2"><span className="h-px w-8 bg-[#bfc1b8]" /> {features[activeIndex].title}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
