/** The client portal overview - deliberately screenshot-able, mobile-first. */
export function PortalPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-pop">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">Website Redesign</span>
        <span className="text-2xs text-muted-foreground">Northline Studio</span>
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-muted-foreground">2 things need your attention</div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent/5 px-3 py-2.5">
            <div>
              <div className="text-[13px] font-medium">Homepage Design</div>
              <div className="text-2xs text-muted-foreground">Approval requested</div>
            </div>
            <span className="rounded-md bg-foreground px-2.5 py-1 text-2xs font-medium text-background">
              Review
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <div className="text-[13px] font-medium">Brand Assets</div>
              <div className="text-2xs text-muted-foreground">3 files requested</div>
            </div>
            <span className="rounded-md border border-border px-2.5 py-1 text-2xs font-medium">Upload</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <span>Progress</span>
            <span>6 of 9 milestones</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: "67%" }} />
          </div>
        </div>

        <div className="mt-5 rounded-md bg-surface px-3 py-2.5">
          <div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Next</div>
          <div className="mt-0.5 text-[13px]">
            Development begins when Homepage Design is approved.
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2.5 text-center text-2xs text-muted-foreground">
        Powered by ClientFold
      </div>
    </div>
  );
}
