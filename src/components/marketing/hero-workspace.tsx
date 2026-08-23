import { FoldMascot } from "@/components/brand/fold-mascot";

export function HeroWorkspace() {
  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="absolute -left-8 top-10 hidden rotate-[-8deg] sm:block"><FoldMascot pose="greeting" size="lg" className="fold-float" /></div>
      <div className="overflow-hidden rounded-2xl border border-[#c9c9c0] bg-[#fbfbf7] shadow-[0_35px_90px_-50px_rgba(35,39,31,0.65)]">
        <div className="flex h-11 items-center justify-between border-b border-[#deddd5] bg-[#efeee8] px-4 text-[9px] uppercase tracking-[0.12em] text-[#7d7f76]"><span>Northstar / client portal</span><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#de7044]" /> 1 thing needs you</span></div>
        <div className="grid min-h-[330px] gap-6 p-5 sm:grid-cols-[1.08fr_0.92fr] sm:p-7">
          <div className="flex flex-col justify-between"><div><p className="text-[9px] uppercase tracking-[0.15em] text-[#85877f]">Your next action</p><h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[#292c26]">Homepage design v3</h2><p className="mt-3 max-w-xs text-[11px] leading-5 text-[#777970]">A clear decision is all that is needed to move the project forward.</p></div><button className="mt-6 bg-[#2d302a] px-4 py-3 text-left text-[10px] font-medium text-white">Review and approve <span className="float-right">→</span></button></div>
          <div className="relative overflow-hidden rounded-xl bg-[#e7eadf] p-5"><div className="absolute inset-0 bg-[radial-gradient(#6a755f_0.75px,transparent_0.75px)] bg-[length:16px_16px] opacity-20" /><div className="relative flex h-full flex-col justify-between"><span className="w-fit rounded-full bg-[#f6f4ec] px-2.5 py-1 text-[8px] font-medium text-[#596453]">The project is ready for you</span><div className="self-center"><FoldMascot pose="helping" size="lg" className="fold-float" /></div><span className="w-fit self-end text-[9px] text-[#596453]">One calm next step</span></div></div>
        </div>
      </div>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.13em] text-[#7d7f76]">A calm place for every approval, file, message, and payment.</p>
    </div>
  );
}
