"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DEMO_WAITING, WAITING_TYPE_LABEL, type WaitingType } from "@/lib/demo/data";

type DemoView = "waiting" | "approval" | "portal";
type DemoFilter = "all" | WaitingType;
type Decision = "idle" | "approved" | "changes";
type PortalTab = "overview" | "files" | "invoices" | "activity";

type DemoEvent = {
  id: string;
  actor: string;
  action: string;
  time: string;
  tone?: "sage" | "rust";
};

const views: { id: DemoView; number: string; label: string; description: string }[] = [
  { id: "waiting", number: "01", label: "Find the blocker", description: "See every item sitting with a client." },
  { id: "approval", number: "02", label: "Close the loop", description: "Compare versions and record a decision." },
  { id: "portal", number: "03", label: "See their side", description: "Give clients one obvious next action." },
];

const filters: { id: DemoFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approval", label: "Approvals" },
  { id: "payment", label: "Payments" },
  { id: "file_request", label: "Files" },
];

const initialEvents: DemoEvent[] = [
  { id: "e1", actor: "Northline Studio", action: "shared Homepage design v3", time: "Yesterday" },
  { id: "e2", actor: "Sarah Whitfield", action: "commented on Homepage design v3", time: "Yesterday" },
  { id: "e3", actor: "Northline Studio", action: "requested Brand assets", time: "18 Aug" },
];

function formatMoney(amount = 0) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function WaitingView({
  decision,
  remindedIds,
  onOpenApproval,
  onRemind,
}: {
  decision: Decision;
  remindedIds: string[];
  onOpenApproval: () => void;
  onRemind: (id: string, title: string) => void;
}) {
  const [filter, setFilter] = useState<DemoFilter>("all");
  const [selectedId, setSelectedId] = useState("w1");
  const activeItems = useMemo(
    () => (decision === "approved" ? DEMO_WAITING.filter((item) => item.id !== "w1") : DEMO_WAITING),
    [decision],
  );
  const rows = useMemo(
    () => (filter === "all" ? activeItems : activeItems.filter((item) => item.type === filter)),
    [activeItems, filter],
  );
  const selected = rows.find((item) => item.id === selectedId) ?? rows[0];
  const outstanding = activeItems.filter((item) => item.type === "payment").reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const approvalCount = activeItems.filter((item) => item.type === "approval").length;

  return (
    <div className="grid min-h-[660px] xl:grid-cols-[1fr_280px]">
      <div className="min-w-0 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Friday, 22 August</p>
            <h2 className="mt-1.5 text-2xl font-medium tracking-[-0.035em] text-[#292c26]">Waiting room</h2>
            <p className="mt-1 text-xs text-[#777970]">Everything currently holding up a project.</p>
          </div>
          <span className="flex items-center gap-2 border border-[#d6d5ce] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-[#686b62]"><span className="size-1.5 rounded-full bg-[#71806a]" /> Live sample data</span>
        </div>

        <div className="mt-6 grid grid-cols-3 border-y border-[#dfded8] py-3.5">
          {[[formatMoney(outstanding), "Outstanding"], [String(approvalCount), "Approvals"], [String(activeItems.length), "Open items"]].map(([value, label]) => (
            <div key={label} className="border-r border-[#dfded8] px-3 first:pl-0 last:border-0">
              <p className="text-base font-semibold tracking-tight text-[#30332c]">{value}</p>
              <p className="mt-0.5 truncate text-[8px] uppercase tracking-[0.12em] text-[#8b8d85]">{label}</p>
            </div>
          ))}
        </div>

        {decision === "approved" ? (
          <button type="button" onClick={onOpenApproval} className="mt-5 flex w-full items-center justify-between border border-[#bfc9ba] bg-[#edf1e9] px-4 py-3 text-left">
            <span><span className="block text-[10px] font-semibold text-[#4e5c48]">Homepage design moved forward</span><span className="mt-0.5 block text-[9px] text-[#71806c]">The approval is no longer in the waiting room.</span></span>
            <span className="text-[#66725f]" aria-hidden>↗</span>
          </button>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto pb-1" aria-label="Filter waiting items">
            {filters.map((item) => {
              const count = item.id === "all" ? activeItems.length : activeItems.filter((row) => row.type === item.id).length;
              return (
                <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors", filter === item.id ? "bg-[#30332c] text-[#f7f6f1]" : "text-[#72746c] hover:bg-[#ecebe5] hover:text-[#30332c]")}>
                  {item.label} <span className={filter === item.id ? "text-white/55" : "text-[#a0a29a]"}>{count}</span>
                </button>
              );
            })}
          </div>
          <span className="hidden text-[9px] text-[#9a9c94] sm:block">Oldest first</span>
        </div>

        <div className="mt-2 divide-y divide-[#e3e2dc] border-t border-[#e3e2dc]">
          {rows.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={cn("grid w-full grid-cols-[1fr_auto] gap-4 border-l-2 py-3.5 pl-3 text-left transition-colors sm:grid-cols-[1.05fr_1.15fr_auto]", selected?.id === item.id ? "border-[#6f7a68] bg-[#f6f5f0] text-[#2d3029]" : "border-transparent text-[#777970] hover:bg-[#f8f7f3] hover:text-[#2d3029]")}>
              <span className="min-w-0"><span className="block truncate text-xs font-medium">{item.clientCompany}</span><span className="mt-0.5 block truncate text-[9px] text-[#888a82]">{item.project}</span></span>
              <span className="hidden min-w-0 sm:block"><span className="block truncate text-xs font-medium">{item.title}</span><span className="mt-0.5 block text-[9px] text-[#888a82]">{remindedIds.includes(item.id) ? "Reminder sent just now" : item.detail}</span></span>
              <span className={cn("self-center text-right text-[10px] tabular-nums", item.daysWaiting >= 5 ? "font-semibold text-[#9a583c]" : "text-[#7c7e76]")}>{item.daysWaiting}d waiting</span>
            </button>
          ))}
          {rows.length === 0 ? <div className="py-12 text-center text-xs text-[#85877f]">Nothing is waiting in this category.</div> : null}
        </div>
      </div>

      <aside className="border-t border-[#dfded8] bg-[#f0efe9] p-5 xl:border-l xl:border-t-0">
        {selected ? (
          <>
            <div className="flex items-center justify-between"><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Selected item</p><span className="rounded-full bg-[#e3ddd0] px-2 py-1 text-[8px] text-[#75694c]">Client action</span></div>
            <p className="mt-8 text-lg font-medium tracking-[-0.025em] text-[#30332c]">{selected.title}</p>
            <p className="mt-1 text-xs text-[#74766e]">{selected.clientCompany} · {selected.project}</p>
            <dl className="mt-7 space-y-4 border-y border-[#dad9d2] py-5 text-[10px]">
              <div className="flex justify-between gap-4"><dt className="text-[#85877f]">Type</dt><dd className="font-medium text-[#3a3d35]">{WAITING_TYPE_LABEL[selected.type]}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#85877f]">Owner</dt><dd className="font-medium text-[#3a3d35]">{selected.client}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#85877f]">Waiting</dt><dd className="font-medium text-[#3a3d35]">{selected.daysWaiting} days</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#85877f]">Status</dt><dd className="text-right font-medium text-[#3a3d35]">{remindedIds.includes(selected.id) ? "Reminder sent" : selected.detail}</dd></div>
            </dl>
            {selected.type === "approval" ? (
              <button type="button" onClick={onOpenApproval} className="mt-6 flex h-10 w-full items-center justify-between rounded-md bg-[#30332c] px-4 text-xs font-medium text-white transition-colors hover:bg-[#474a41]">Open approval <span aria-hidden>→</span></button>
            ) : (
              <button type="button" disabled={remindedIds.includes(selected.id)} onClick={() => onRemind(selected.id, selected.title)} className="mt-6 flex h-10 w-full items-center justify-between rounded-md bg-[#30332c] px-4 text-xs font-medium text-white transition-colors hover:bg-[#474a41] disabled:cursor-default disabled:bg-[#dfe4dc] disabled:text-[#63705e]">
                {remindedIds.includes(selected.id) ? "Reminder sent" : "Send a gentle reminder"}<span aria-hidden>{remindedIds.includes(selected.id) ? "✓" : "→"}</span>
              </button>
            )}
            <p className="mt-3 text-[9px] leading-4 text-[#85877f]">Every follow-up is logged on the project, so the team always has context.</p>
          </>
        ) : <p className="text-xs text-[#85877f]">Choose another category to inspect an item.</p>}
      </aside>
    </div>
  );
}

const versionNotes = {
  v3: { date: "21 Aug", label: "Current", note: "Warmer palette, simplified navigation and a stronger product story." },
  v2: { date: "18 Aug", label: "Changes requested", note: "Sarah asked for a warmer direction and less emphasis on wholesale." },
  v1: { date: "15 Aug", label: "Changes requested", note: "First visual direction shared with the Northstar team." },
};

function DesignPreview({ version, selectedPin, onSelectPin }: { version: keyof typeof versionNotes; selectedPin: number; onSelectPin: (pin: number) => void }) {
  return (
    <div className={cn("relative overflow-hidden rounded-sm shadow-[0_12px_35px_-22px_rgba(30,32,27,0.65)] transition-colors", version === "v1" ? "bg-[#e8eceb]" : version === "v2" ? "bg-[#efe8de]" : "bg-[#f6efe4]")}>
      <div className="flex h-9 items-center justify-between border-b border-black/10 px-4 text-[7px] uppercase tracking-[0.16em] text-[#625e55]"><span>Northstar</span><span>Journal&nbsp;&nbsp;&nbsp;About&nbsp;&nbsp;&nbsp;Visit</span></div>
      <div className="grid min-h-[345px] grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between p-5 sm:p-8">
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#8b765b]">{version === "v1" ? "Coffee for modern teams" : "Small rituals, better days"}</p>
          <p className="max-w-xs font-editorial text-3xl leading-[0.95] tracking-[-0.04em] text-[#393a34] sm:text-5xl">{version === "v1" ? "Fuel better work." : version === "v2" ? "Make time for better coffee." : "Coffee worth slowing down for."}</p>
          <span className="w-fit border-b border-[#5e6058] pb-1 text-[8px] uppercase tracking-[0.12em]">Explore the collection</span>
        </div>
        <div className={cn("relative m-3 overflow-hidden sm:m-5", version === "v1" ? "bg-[#718087]" : "bg-[#6b745e]")}>
          <div className="absolute inset-x-[20%] bottom-0 top-[18%] rounded-t-full border border-white/25 bg-black/10" />
          <div className="absolute bottom-[15%] left-[30%] h-[38%] w-[42%] rounded-b-[45%] rounded-t-sm border border-white/20 bg-[#c4a679]" />
          <span className="absolute bottom-3 right-3 text-[7px] uppercase tracking-[0.15em] text-white/65">No. 03 · Colombia</span>
        </div>
      </div>
      {version === "v3" ? (
        <>
          <button type="button" onClick={() => onSelectPin(1)} aria-label="Open comment 1" className={cn("absolute left-[46%] top-[37%] flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white shadow-md", selectedPin === 1 ? "bg-[#884f39]" : "bg-[#677362]")}>1</button>
          <button type="button" onClick={() => onSelectPin(2)} aria-label="Open comment 2" className={cn("absolute bottom-[23%] right-[18%] flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white shadow-md", selectedPin === 2 ? "bg-[#884f39]" : "bg-[#677362]")}>2</button>
        </>
      ) : null}
    </div>
  );
}

function ApprovalView({
  decision,
  onBack,
  onPortal,
  onDecision,
}: {
  decision: Decision;
  onBack: () => void;
  onPortal: () => void;
  onDecision: (decision: Exclude<Decision, "idle">, note: string) => void;
}) {
  const [version, setVersion] = useState<keyof typeof versionNotes>("v3");
  const [intent, setIntent] = useState<"idle" | "approve" | "changes">("idle");
  const [note, setNote] = useState("");
  const [selectedPin, setSelectedPin] = useState(1);
  const [comments, setComments] = useState(["The warmer direction feels right. Can we keep this line short on mobile?", "The product crop is much stronger here."]);
  const [draftComment, setDraftComment] = useState("");

  function addComment() {
    if (!draftComment.trim()) return;
    setComments((current) => current.map((comment, index) => index === selectedPin - 1 ? draftComment.trim() : comment));
    setDraftComment("");
  }

  return (
    <div className="min-h-[660px] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dfded8] pb-5">
        <div className="flex items-start gap-4">
          <button type="button" onClick={onBack} className="mt-0.5 flex size-8 items-center justify-center rounded-md border border-[#d4d3cc] text-sm text-[#6e7068] transition-colors hover:bg-[#efeee8]" aria-label="Back to waiting room">←</button>
          <div><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Northstar Website Redesign</p><h2 className="mt-1.5 text-2xl font-medium tracking-[-0.035em] text-[#292c26]">Homepage design <span className="text-[#8a8c83]">{version}</span></h2></div>
        </div>
        <span className={cn("rounded-full px-3 py-1.5 text-[9px] font-medium", decision === "approved" ? "bg-[#dde5d8] text-[#53604d]" : decision === "changes" ? "bg-[#eee0da] text-[#864b34]" : "bg-[#ebe7d8] text-[#756738]")}>{decision === "approved" ? "Approved just now" : decision === "changes" ? "Changes requested" : "Awaiting approval · 4 days"}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_270px]">
        <div>
          <div className="overflow-hidden rounded-lg border border-[#d6d5ce] bg-[#dddcd5]">
            <div className="flex items-center justify-between border-b border-[#cfcec8] bg-[#f7f6f1] px-4 py-2.5 text-[9px] text-[#7b7d75]"><span>homepage-{version}.png</span><span>1440 × 1024 · 2 comments</span></div>
            <div className="p-4 sm:p-7"><DesignPreview version={version} selectedPin={selectedPin} onSelectPin={setSelectedPin} /></div>
          </div>
          {version === "v3" ? (
            <div className="mt-3 grid gap-3 border border-[#dcdbd4] bg-[#f7f6f1] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div><p className="text-[9px] font-semibold text-[#41443b]">Comment {selectedPin} · Sarah Whitfield</p><p className="mt-1 text-[9px] leading-4 text-[#74766e]">{comments[selectedPin - 1]}</p></div>
              <div className="flex gap-2"><input value={draftComment} onChange={(event) => setDraftComment(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addComment()} placeholder="Reply to thread" className="h-8 min-w-0 border border-[#d2d1ca] bg-white px-2 text-[9px] outline-none focus:border-[#778371]" /><button type="button" onClick={addComment} className="h-8 bg-[#30332c] px-3 text-[9px] font-medium text-white">Reply</button></div>
            </div>
          ) : null}
        </div>

        <aside>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Version history</p>
          <div className="mt-3 divide-y divide-[#dfded8] border-y border-[#dfded8]">
            {(Object.keys(versionNotes) as (keyof typeof versionNotes)[]).map((item) => (
              <button type="button" key={item} onClick={() => setVersion(item)} className={cn("grid w-full grid-cols-[32px_1fr_auto] gap-2 border-l-2 py-3 pl-2 text-left text-[9px] transition-colors", version === item ? "border-[#6f7a68] bg-[#f3f2ed]" : "border-transparent hover:bg-[#f6f5f0]")}><span className="font-mono text-[#555850]">{item}</span><span className="text-[#777970]">{versionNotes[item].label}</span><span className="text-[#969890]">{versionNotes[item].date}</span></button>
            ))}
          </div>
          <p className="mt-3 min-h-12 text-[9px] leading-4 text-[#7b7d75]">{versionNotes[version].note}</p>

          {version !== "v3" ? <button type="button" onClick={() => setVersion("v3")} className="mt-4 w-full border border-[#cccbc4] py-2.5 text-[10px] font-medium text-[#3c3f37]">Return to current version</button> : null}

          {version === "v3" && decision === "idle" && intent === "idle" ? (
            <div className="mt-5 space-y-2">
              <button type="button" onClick={() => setIntent("approve")} className="h-10 w-full rounded-md bg-[#566151] text-xs font-medium text-white transition-colors hover:bg-[#687361]">Approve v3</button>
              <button type="button" onClick={() => setIntent("changes")} className="h-10 w-full rounded-md border border-[#cccbc4] text-xs font-medium text-[#3c3f37] transition-colors hover:bg-[#f0efe9]">Request changes</button>
            </div>
          ) : null}

          {intent !== "idle" && decision === "idle" ? (
            <div className="mt-5 border border-[#d5d4cd] bg-[#f4f3ee] p-3">
              <p className="text-[10px] font-semibold text-[#3b3e36]">{intent === "approve" ? "Confirm approval" : "What needs changing?"}</p>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder={intent === "approve" ? "Optional note for the studio" : "Describe the change clearly"} className="mt-3 w-full resize-none border border-[#d2d1ca] bg-white p-2 text-[9px] leading-4 outline-none focus:border-[#778371]" />
              <div className="mt-2 flex gap-2"><button type="button" onClick={() => setIntent("idle")} className="h-8 flex-1 border border-[#cecdc6] text-[9px] text-[#6e7068]">Cancel</button><button type="button" onClick={() => onDecision(intent === "approve" ? "approved" : "changes", note)} className="h-8 flex-1 bg-[#30332c] text-[9px] font-medium text-white">{intent === "approve" ? "Confirm" : "Send feedback"}</button></div>
            </div>
          ) : null}

          {decision !== "idle" ? (
            <div className={cn("mt-5 border p-4", decision === "approved" ? "border-[#bdc8b7] bg-[#edf1e9]" : "border-[#d9c2b8] bg-[#f3e9e4]")}>
              <p className="text-[10px] font-semibold text-[#3d4639]">{decision === "approved" ? "Decision recorded" : "Feedback sent"}</p>
              <p className="mt-1.5 text-[9px] leading-4 text-[#6f756a]">{decision === "approved" ? "Development is now unblocked and the client record is up to date." : "The studio has a clear next step, attached to this exact version."}</p>
              <button type="button" onClick={onPortal} className="mt-4 flex w-full items-center justify-between border-t border-black/10 pt-3 text-left text-[10px] font-medium text-[#596453]">See what Sarah sees <span aria-hidden>→</span></button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function PortalView({
  decision,
  uploaded,
  paid,
  events,
  onReview,
  onUpload,
  onPay,
}: {
  decision: Decision;
  uploaded: boolean;
  paid: boolean;
  events: DemoEvent[];
  onReview: () => void;
  onUpload: () => void;
  onPay: () => void;
}) {
  const [tab, setTab] = useState<PortalTab>("overview");
  const [uploadReady, setUploadReady] = useState(false);
  const openActions = (decision === "approved" ? 0 : 1) + (uploaded ? 0 : 1);
  const tabs: { id: PortalTab; label: string }[] = [{ id: "overview", label: "Overview" }, { id: "files", label: "Files" }, { id: "invoices", label: "Invoices" }, { id: "activity", label: "Activity" }];

  return (
    <div className="min-h-[660px] bg-[#e8e7e0] p-3 sm:p-7">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[14px] border border-[#cfcec7] bg-[#fbfbf7] shadow-[0_24px_65px_-40px_rgba(38,41,34,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#deddd7] px-5 py-4">
          <div><p className="text-sm font-semibold text-[#30332c]">Northstar Ltd</p><p className="mt-0.5 text-[9px] text-[#85877f]">Website redesign · Prepared by Northline Studio</p></div>
          <div className="flex gap-1" role="tablist" aria-label="Client portal sections">{tabs.map((item) => <button role="tab" aria-selected={tab === item.id} key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("px-2.5 py-1.5 text-[9px] transition-colors", tab === item.id ? "bg-[#30332c] text-white" : "text-[#777970] hover:bg-[#efeee8]")}>{item.label}</button>)}</div>
        </div>

        {tab === "overview" ? (
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Good afternoon, Sarah</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-[#292c26]">{openActions === 0 ? "You’re all caught up." : openActions === 1 ? "One thing needs you." : "Two things need you."}</h2></div><div className="text-right"><p className="text-[10px] text-[#697363]">Project {decision === "approved" ? "78" : "67"}% complete</p><p className="mt-1 text-[8px] text-[#9a9c94]">Target: 30 September</p></div></div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={onReview} className={cn("group border p-4 text-left transition-colors", decision === "approved" ? "border-[#d6d5ce] bg-[#f6f5f0]" : "border-[#aeb8a7] bg-[#eef1eb] hover:bg-[#e5eae1]")}><div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[0.13em] text-[#697363]">Approval</span><span className="text-[#697363] transition-transform group-hover:translate-x-0.5">{decision === "approved" ? "✓" : "→"}</span></div><p className="mt-8 text-sm font-medium text-[#30332c]">Homepage design v3</p><p className="mt-1 text-[9px] text-[#777970]">{decision === "approved" ? "Approved just now" : decision === "changes" ? "Changes requested · awaiting studio" : "Ready for your review"}</p></button>
              <button type="button" onClick={() => uploaded ? setTab("files") : setUploadReady(true)} className={cn("group border p-4 text-left transition-colors", uploaded ? "border-[#d6d5ce] bg-[#f6f5f0]" : "border-[#d6d5ce] hover:bg-[#f3f2ed]")}><div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[0.13em] text-[#85877f]">File request</span><span className="text-[#7a7c74] transition-transform group-hover:translate-x-0.5">{uploaded ? "✓" : "+"}</span></div><p className="mt-8 text-sm font-medium text-[#30332c]">Brand assets</p><p className="mt-1 text-[9px] text-[#777970]">{uploaded ? "3 files added just now" : "3 files requested"}</p></button>
            </div>
            {uploadReady && !uploaded ? (
              <div className="mt-3 border border-[#cfd5ca] bg-[#f0f3ed] p-4">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold text-[#3e463a]">3 sample files ready</p><p className="mt-1 text-[9px] text-[#737a6e]">northstar-logo.svg · brand-guide.pdf · product-shots.zip</p></div><button type="button" onClick={() => setUploadReady(false)} className="text-xs text-[#85877f]" aria-label="Close upload panel">×</button></div>
                <button type="button" onClick={onUpload} className="mt-3 h-9 bg-[#566151] px-4 text-[9px] font-medium text-white">Add files to project</button>
              </div>
            ) : null}
            <div className="mt-8 border-t border-[#deddd7] pt-6"><div className="flex items-center justify-between text-[9px] text-[#777970]"><span>Project progress</span><span>{decision === "approved" ? "7" : "6"} of 9 milestones</span></div><div className="mt-2 h-1 bg-[#e3e2dc]"><div className="h-full bg-[#63705d] transition-all duration-500" style={{ width: decision === "approved" ? "78%" : "67%" }} /></div></div>
            <div className="mt-7 grid gap-5 border-t border-[#deddd7] pt-6 sm:grid-cols-[1fr_auto]"><div><p className="text-[9px] uppercase tracking-[0.13em] text-[#85877f]">What happens next</p><p className="mt-2 text-xs leading-5 text-[#555850]">{decision === "approved" ? "Northline starts development on Monday. You’ll see the staging link here." : "Development begins as soon as the homepage design is approved."}</p></div>{decision === "approved" ? <span className="self-center rounded-full bg-[#e4eadf] px-3 py-2 text-[9px] font-medium text-[#566151]">Development unlocked</span> : <button type="button" onClick={onReview} className="h-9 rounded-md bg-[#30332c] px-4 text-[10px] font-medium text-white">Review homepage</button>}</div>
          </div>
        ) : null}

        {tab === "files" ? (
          <div className="p-5 sm:p-8"><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Shared files</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-[#292c26]">Everything in one place.</h2><div className="mt-7 divide-y divide-[#e1e0da] border-y border-[#e1e0da]">{[["Homepage design v3", "PNG · 3.8 MB", "Northline Studio"], ["Northstar copy deck", "DOCX · 84 KB", "Sarah Whitfield"], ...(uploaded ? [["Brand assets", "3 files · 46 MB", "Sarah Whitfield"]] : [])].map(([name, meta, owner]) => <div key={name} className="grid grid-cols-[1fr_auto] gap-4 py-4 sm:grid-cols-[1fr_1fr_auto]"><span className="text-xs font-medium text-[#3c3f37]">{name}</span><span className="hidden text-[9px] text-[#85877f] sm:block">{owner}</span><span className="text-[9px] text-[#85877f]">{meta}</span></div>)}</div>{!uploaded ? <button type="button" onClick={() => { setTab("overview"); setUploadReady(true); }} className="mt-6 h-9 bg-[#30332c] px-4 text-[10px] font-medium text-white">Answer file request</button> : null}</div>
        ) : null}

        {tab === "invoices" ? (
          <div className="p-5 sm:p-8"><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Invoices</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-[#292c26]">Clear, without the chase.</h2><div className="mt-7 border border-[#d9d8d2]"><div className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-sm font-medium text-[#34372f]">INV-104 · Design milestone</p><p className="mt-1 text-[9px] text-[#85877f]">Issued 8 August · Due 14 August</p></div><div className="text-right"><p className="text-lg font-semibold text-[#30332c]">£6,020</p><p className={cn("mt-1 text-[9px]", paid ? "text-[#596453]" : "text-[#96563e]")}>{paid ? "Paid just now" : "8 days overdue"}</p></div></div><div className="flex items-center justify-between border-t border-[#deddd7] bg-[#f4f3ee] px-5 py-3"><span className="text-[9px] text-[#777970]">Secure card payment · Demo only</span><button type="button" disabled={paid} onClick={onPay} className="h-8 bg-[#30332c] px-4 text-[9px] font-medium text-white disabled:bg-[#dfe4dc] disabled:text-[#63705e]">{paid ? "Payment recorded" : "Pay invoice"}</button></div></div></div>
        ) : null}

        {tab === "activity" ? (
          <div className="p-5 sm:p-8"><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Project activity</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-[#292c26]">The whole story, in order.</h2><div className="mt-7 divide-y divide-[#e1e0da] border-y border-[#e1e0da]">{events.map((event) => <div key={event.id} className="grid grid-cols-[8px_1fr_auto] items-center gap-3 py-4"><span className={cn("size-1.5 rounded-full", event.tone === "rust" ? "bg-[#9a583c]" : "bg-[#6f7a68]")} /><p className="text-[10px] text-[#555850]"><span className="font-semibold text-[#3b3e36]">{event.actor}</span> {event.action}</p><span className="text-[9px] text-[#969890]">{event.time}</span></div>)}</div></div>
        ) : null}

        <div className="border-t border-[#deddd7] px-5 py-3 text-center text-[8px] uppercase tracking-[0.14em] text-[#969890]">A ClientFold portal · Demo data only</div>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-[9px] text-[#777970]">You are viewing the project as Sarah. Every action stays inside this demo.</p>
    </div>
  );
}

export function GuidedDemo() {
  const [view, setView] = useState<DemoView>("waiting");
  const [decision, setDecision] = useState<Decision>("idle");
  const [uploaded, setUploaded] = useState(false);
  const [paid, setPaid] = useState(false);
  const [remindedIds, setRemindedIds] = useState<string[]>([]);
  const [events, setEvents] = useState<DemoEvent[]>(initialEvents);
  const [toast, setToast] = useState("");
  const active = views.findIndex((item) => item.id === view);
  const completed = [remindedIds.length > 0 || view !== "waiting", decision !== "idle", uploaded || paid];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function addEvent(event: Omit<DemoEvent, "id" | "time">) {
    setEvents((current) => [{ ...event, id: `event-${Date.now()}`, time: "Just now" }, ...current]);
  }

  function resetDemo() {
    setView("waiting");
    setDecision("idle");
    setUploaded(false);
    setPaid(false);
    setRemindedIds([]);
    setEvents(initialEvents);
    setToast("Demo reset");
  }

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#c9c9c0] bg-[#fbfbf7] shadow-[0_30px_80px_-48px_rgba(35,39,31,0.65)]">
      <div className="flex min-h-12 items-center justify-between border-b border-[#d9d8d2] bg-[#efeee8] px-4 sm:px-5">
        <div className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded bg-[#566151] text-[9px] font-semibold text-white">N</span><span className="text-[10px] font-semibold text-[#35382f]">Northline Studio</span><span className="hidden text-[9px] text-[#85877f] sm:inline">/ Northstar website</span></div>
        <div className="flex items-center gap-3"><p className="text-[9px] text-[#777970]">Step {active + 1} of {views.length}</p><button type="button" onClick={resetDemo} className="border-l border-[#d4d3cc] pl-3 text-[9px] text-[#777970] transition-colors hover:text-[#34372f]">Reset</button></div>
      </div>
      <div className="grid lg:grid-cols-[210px_1fr]">
        <nav className="border-b border-[#d9d8d2] bg-[#f3f2ed] p-3 lg:border-b-0 lg:border-r lg:p-4" aria-label="Demo chapters">
          <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
            {views.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setView(item.id)} className={cn("min-w-[170px] rounded-lg p-3 text-left transition-colors lg:w-full lg:min-w-0", view === item.id ? "bg-[#fbfbf7] shadow-xs" : "hover:bg-[#ebeae4]")} aria-current={view === item.id ? "step" : undefined}>
                <span className="flex items-center justify-between"><span className={cn("font-mono text-[8px]", view === item.id ? "text-[#596453]" : "text-[#9a9b94]")}>{item.number}</span><span className={cn("flex size-4 items-center justify-center rounded-full text-[8px]", completed[index] ? "bg-[#697563] text-white" : index <= active ? "border border-[#697563] text-[#697563]" : "border border-[#c5c6bf] text-transparent")}>{completed[index] ? "✓" : "·"}</span></span>
                <span className="mt-3 block text-[11px] font-medium text-[#34372f]">{item.label}</span>
                <span className="mt-1 hidden text-[9px] leading-4 text-[#7b7d75] lg:block">{item.description}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 hidden border-t border-[#d9d8d2] pt-4 lg:block"><p className="text-[8px] uppercase tracking-[0.13em] text-[#9a9c94]">Live outcome</p><p className="mt-2 text-[9px] leading-4 text-[#73766d]">{decision === "approved" ? "Design approved. Development is unblocked." : decision === "changes" ? "Feedback is tied to v3 for the studio." : "One decision is holding up development."}</p></div>
        </nav>
        <div className="min-w-0 bg-[#fbfbf7]">
          {view === "waiting" ? <WaitingView decision={decision} remindedIds={remindedIds} onOpenApproval={() => setView("approval")} onRemind={(id, title) => { setRemindedIds((current) => current.includes(id) ? current : [...current, id]); addEvent({ actor: "Northline Studio", action: `sent a reminder for ${title}` }); setToast("Reminder logged on the project"); }} /> : null}
          {view === "approval" ? <ApprovalView decision={decision} onBack={() => setView("waiting")} onPortal={() => setView("portal")} onDecision={(nextDecision, note) => { setDecision(nextDecision); addEvent({ actor: "Sarah Whitfield", action: nextDecision === "approved" ? `approved Homepage design v3${note.trim() ? " with a note" : ""}` : "requested changes on Homepage design v3", tone: nextDecision === "changes" ? "rust" : "sage" }); setToast(nextDecision === "approved" ? "Approval recorded — development unblocked" : "Feedback sent to Northline Studio"); }} /> : null}
          {view === "portal" ? <PortalView decision={decision} uploaded={uploaded} paid={paid} events={events} onReview={() => setView("approval")} onUpload={() => { setUploaded(true); addEvent({ actor: "Sarah Whitfield", action: "uploaded 3 Brand assets" }); setToast("3 files added to the project"); }} onPay={() => { setPaid(true); addEvent({ actor: "Sarah Whitfield", action: "paid invoice INV-104" }); setToast("Demo payment recorded"); }} /> : null}
        </div>
      </div>
      <div aria-live="polite" className={cn("pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#30332c] px-4 py-2 text-[10px] font-medium text-white shadow-lg transition-all", toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>{toast}</div>
    </div>
  );
}
