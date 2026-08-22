import { cn } from "@/lib/utils";

/** The ClientFold mark — a folded corner, restrained and monochrome. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-5", className)} aria-hidden>
      <path
        d="M4 3.5h10.5L20 9v11.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5Z"
        className="fill-foreground"
      />
      <path d="M14.5 3.5V8a1 1 0 0 0 1 1H20" className="fill-background/25" />
      <path d="M8 13.5h8M8 17h5" className="stroke-background" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>ClientFold</span>
    </span>
  );
}
