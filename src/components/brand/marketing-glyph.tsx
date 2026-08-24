import { cn } from "@/lib/utils";

export function MarketingGlyph({ type, className }: { type: "approval" | "file" | "invoice"; className?: string }) {
  const paths = {
    approval: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    file: <><path d="M6 3.5h7l5 5v12H6z" /><path d="M13 3.5v5h5M9 14h6M9 17h4" /></>,
    invoice: <><path d="M6 4h12v16l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20z" /><path d="M9 9h6M9 13h6" /></>,
  };
  return <svg viewBox="0 0 24 24" className={cn("size-5", className)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}
