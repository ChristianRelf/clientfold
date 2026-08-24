import { Badge } from "@/components/ui/badge";

/** A static render of the approval version history - an ad-ready product moment. */
export function ApprovalPreview() {
  const versions = [
    { v: 3, status: "Awaiting Approval", tone: "waiting" as const, date: "Today" },
    { v: 2, status: "Changes requested", tone: "danger" as const, date: "18 Aug" },
    { v: 1, status: "Changes requested", tone: "danger" as const, date: "15 Aug" },
  ];
  return (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">Homepage Design</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">Northstar Ltd · Design</div>
        </div>
        <Badge tone="waiting">Awaiting Approval</Badge>
      </div>

      <div className="mt-5 space-y-2">
        {versions.map((ver) => (
          <div
            key={ver.v}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">v{ver.v}</span>
              <span className="text-[13px] font-medium">Version {ver.v}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={ver.tone}>{ver.status}</Badge>
              <span className="text-2xs text-muted-foreground">{ver.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button className="flex-1 rounded-md bg-success px-3 py-2 text-[13px] font-medium text-white">
          Approve
        </button>
        <button className="flex-1 rounded-md border border-border px-3 py-2 text-[13px] font-medium">
          Request changes
        </button>
      </div>
    </div>
  );
}
