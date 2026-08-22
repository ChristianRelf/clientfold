import { cn } from "@/lib/utils";

/** A restrained browser chrome used to present real product surfaces. */
export function BrowserFrame({
  url = "clientfold.com/waiting",
  children,
  className,
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface shadow-pop", className)}>
      <div className="flex items-center gap-2 border-b border-border bg-background/60 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex h-6 max-w-sm flex-1 items-center justify-center rounded-md border border-border bg-muted/50 px-3 text-2xs text-muted-foreground">
          {url}
        </div>
        <div className="w-10" />
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}
