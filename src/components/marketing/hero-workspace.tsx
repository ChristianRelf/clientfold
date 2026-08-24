const timeline = [
  { label: "Approval requested", detail: "Monday · 10:14", tone: "quiet" },
  { label: "Gentle reminder sent", detail: "Thursday · 10:00", tone: "warm" },
  { label: "Homepage approved", detail: "Today · 09:42", tone: "done" },
] as const;

export function HeroWorkspace() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="hero-workspace relative overflow-hidden rounded-2xl border border-[#c9c9c0] bg-[#fbfbf7] shadow-[0_38px_95px_-52px_rgba(35,39,31,0.7)]">
        <div className="hero-glow absolute -right-24 -top-24 size-72 rounded-full bg-[#dfe4da] opacity-70 blur-3xl" aria-hidden />
        <div className="relative flex h-11 items-center justify-between border-b border-[#deddd5] bg-[#efeee8]/90 px-4 text-[9px] uppercase tracking-[0.12em] text-[#7d7f76]">
          <span>Northstar / Website redesign</span>
          <span className="flex items-center gap-2"><span className="hero-live-dot size-1.5 rounded-full bg-[#de7044]" /> Live project</span>
        </div>

        <div className="relative grid min-h-[390px] sm:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[#deddd5] p-5 sm:border-b-0 sm:border-r sm:p-7">
            <div className="hero-action-card flex h-full flex-col rounded-xl border border-[#d8d7d0] bg-[#fffefa] p-5 shadow-[0_24px_50px_-36px_rgba(38,41,34,.55)]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Needs Sarah</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#292c26]">Homepage design v3</h2></div>
                <span className="hero-status rounded-full bg-[#f1dfd5] px-2.5 py-1 text-[9px] font-medium text-[#995333]">Awaiting approval</span>
              </div>
              <div className="mt-7 space-y-3 border-y border-[#e1e0da] py-4 text-[10px]">
                <div className="flex justify-between"><span className="text-[#85877f]">Project</span><span className="font-medium text-[#3c3f37]">Northstar website</span></div>
                <div className="flex justify-between"><span className="text-[#85877f]">Follow-up</span><span className="flex items-center gap-2 font-medium text-[#596453]"><span className="size-1.5 rounded-full bg-[#6e9a63]" /> Autopilot on</span></div>
              </div>
              <div className="mt-auto pt-6">
                <div className="hero-approved-note mb-3 flex items-center gap-2 rounded-lg bg-[#e7efe3] px-3 py-2.5 text-[9px] font-medium text-[#52684b]"><span className="grid size-5 place-items-center rounded-full bg-[#6f9565] text-white">✓</span> Approved — development unlocked</div>
                <div className="bg-[#2d302a] px-4 py-3 text-[10px] font-medium text-white">Review and approve <span className="float-right">→</span></div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#f0f1e9] p-5 sm:p-7">
            <div className="absolute bottom-0 left-9 top-0 w-px bg-[#d0d3c8]" aria-hidden />
            <p className="relative z-10 text-[9px] uppercase tracking-[0.15em] text-[#7d8077]">Project momentum</p>
            <ol className="relative z-10 mt-7 space-y-4">
              {timeline.map((item, index) => (
                <li key={item.label} className={`hero-timeline-step hero-timeline-step--${index + 1} grid grid-cols-[28px_1fr] items-center gap-3`}>
                  <span className={`grid size-7 place-items-center rounded-full border text-[9px] font-semibold ${item.tone === "done" ? "border-[#6f9565] bg-[#6f9565] text-white" : item.tone === "warm" ? "border-[#de7044] bg-[#fbefe9] text-[#a65331]" : "border-[#c4c7bd] bg-[#f8f7f2] text-[#7c7e76]"}`}>{item.tone === "done" ? "✓" : index + 1}</span>
                  <div className="rounded-lg border border-[#d8d9d1] bg-[#fbfbf7] p-3"><p className="text-[10px] font-medium text-[#34372f]">{item.label}</p><p className="mt-1 text-[8px] text-[#85877f]">{item.detail}</p></div>
                </li>
              ))}
            </ol>
            <div className="hero-next-step relative z-10 mt-5 border-l-2 border-[#718069] bg-[#e5e9df] p-3"><p className="text-[8px] uppercase tracking-[0.13em] text-[#718069]">Up next</p><p className="mt-1 text-[10px] font-medium text-[#34372f]">Development begins</p></div>
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.13em] text-[#7d7f76]">Approvals · Files · Messages · Payments · All moving together</p>
    </div>
  );
}
