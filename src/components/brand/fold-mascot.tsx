import { cn } from "@/lib/utils";

type FoldMascotProps = {
  className?: string;
  pose?: "greeting" | "helping" | "celebrating" | "resting";
  size?: "sm" | "md" | "lg";
};

const sizes = { sm: "h-14 w-12", md: "h-24 w-20", lg: "h-40 w-32" };

/** Fold: a friendly sheet of paper with a folded corner, face, arms and legs. */
export function FoldMascot({ className, pose = "resting", size = "md" }: FoldMascotProps) {
  const leftArm = {
    greeting: "M22 52C10 48 9 34 16 26",
    helping: "M22 55C13 60 11 69 16 75",
    celebrating: "M22 52C12 43 9 31 14 22",
    resting: "M22 56C14 62 14 71 19 77",
  }[pose];
  const rightArm = {
    greeting: "M82 56C90 61 91 70 86 76",
    helping: "M82 51C89 48 91 45 92 40",
    celebrating: "M82 52C91 42 93 30 88 21",
    resting: "M82 56C90 62 90 71 85 77",
  }[pose];
  const leftHand = pose === "greeting" || pose === "celebrating" ? { cx: 16, cy: pose === "greeting" ? 25 : 21 } : { cx: pose === "helping" ? 16 : 19, cy: pose === "helping" ? 75 : 77 };
  const rightHand = pose === "celebrating" ? { cx: 88, cy: 20 } : pose === "helping" ? { cx: 92, cy: 39 } : { cx: pose === "greeting" ? 86 : 85, cy: pose === "greeting" ? 76 : 77 };
  const smile = pose === "celebrating" ? "M43 58C48 65 57 65 62 58" : "M44 59C48 63 56 63 60 59";

  return (
    <svg viewBox="0 0 104 120" className={cn(sizes[size], "fold-mascot", `fold-mascot--${pose}`, className)} aria-hidden="true" fill="none">
      {pose === "celebrating" ? <path d="M10 18 6 13m14 1 1-7m64 10 5-5m-1 14 7 1M52 7V1" className="stroke-[#de7044]" strokeWidth="2.2" strokeLinecap="round" /> : null}

      <path d={leftArm} className="stroke-[#566151]" strokeWidth="4" strokeLinecap="round" />
      <circle cx={leftHand.cx} cy={leftHand.cy} r="4" className="fill-[#f6f2e8] stroke-[#566151]" strokeWidth="2" />
      {pose === "greeting" ? <path d="M12 22 9 18m8 4 1-5m2 8 5-2" className="stroke-[#566151]" strokeWidth="1.8" strokeLinecap="round" /> : null}

      <path d={rightArm} className="stroke-[#566151]" strokeWidth="4" strokeLinecap="round" />
      <circle cx={rightHand.cx} cy={rightHand.cy} r="4" className="fill-[#f6f2e8] stroke-[#566151]" strokeWidth="2" />

      <path d={pose === "celebrating" ? "M43 87c-1 10-5 17-12 22" : "M43 87v20"} className="stroke-[#566151]" strokeWidth="4" strokeLinecap="round" />
      <path d={pose === "celebrating" ? "M63 87c2 9 7 14 14 17" : "M63 87v20"} className="stroke-[#566151]" strokeWidth="4" strokeLinecap="round" />
      <path d={pose === "celebrating" ? "M24 109c3-3 7-4 10-1" : "M34 108h13"} className="stroke-[#30342d]" strokeWidth="5" strokeLinecap="round" />
      <path d={pose === "celebrating" ? "M74 104c3-2 7-1 10 2" : "M59 108h13"} className="stroke-[#30342d]" strokeWidth="5" strokeLinecap="round" />

      <path d="M25 13h43l16 17v53a6 6 0 0 1-6 6H25a6 6 0 0 1-6-6V19a6 6 0 0 1 6-6Z" className="fill-[#f8f5ec] stroke-[#566151]" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M68 13v12a5 5 0 0 0 5 5h11" className="fill-[#e6b29c] stroke-[#566151]" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 17 81 27" className="stroke-[#f5d7c9]" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M35 43c2-2 5-2 7 0M62 43c2-2 5-2 7 0" className="stroke-[#30342d]" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="39" cy="49" rx="3" ry="4" className="fill-[#30342d]" />
      <ellipse cx="66" cy="49" rx="3" ry="4" className="fill-[#30342d]" />
      <circle cx="40" cy="48" r="0.9" className="fill-white" />
      <circle cx="67" cy="48" r="0.9" className="fill-white" />
      <circle cx="31" cy="58" r="3" className="fill-[#e6b29c] opacity-60" />
      <circle cx="74" cy="58" r="3" className="fill-[#e6b29c] opacity-60" />
      <path d={smile} className="stroke-[#30342d]" strokeWidth="2.2" strokeLinecap="round" />

      <path d="M33 73h38M33 79h25" className="stroke-[#aeb5a7]" strokeWidth="2" strokeLinecap="round" />

      {pose === "helping" ? <><rect x="87" y="30" width="15" height="18" rx="3" className="fill-[#de7044] stroke-[#566151]" strokeWidth="1.8" /><path d="m91 39 3 3 5-6" stroke="#fffaf4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></> : null}
    </svg>
  );
}

export function FoldGlyph({ type, className }: { type: "approval" | "file" | "invoice"; className?: string }) {
  const paths = {
    approval: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    file: <><path d="M6 3.5h7l5 5v12H6z" /><path d="M13 3.5v5h5M9 14h6M9 17h4" /></>,
    invoice: <><path d="M6 4h12v16l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20z" /><path d="M9 9h6M9 13h6" /></>,
  };
  return <svg viewBox="0 0 24 24" className={cn("size-5", className)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}
