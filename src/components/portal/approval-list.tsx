import { Badge } from "@/components/ui/badge";
import { ApprovalActions } from "./approval-actions";
import { formatDate } from "@/lib/format";
import type { PortalApproval } from "@/lib/portal-view";

const STATUS: Record<string, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  awaiting_approval: { label: "Awaiting your approval", tone: "waiting" },
  approved: { label: "Approved", tone: "success" },
  changes_requested: { label: "Changes requested", tone: "danger" },
  draft: { label: "Draft", tone: "neutral" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  superseded: { label: "Superseded", tone: "neutral" },
};

export function ApprovalList({ approvals, demo = false }: { approvals: PortalApproval[]; demo?: boolean }) {
  if (approvals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center">
        <p className="text-sm font-medium">Nothing to approve.</p>
        <p className="mt-1 text-2xs text-muted-foreground">Approvals will appear here when the team sends work.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((a) => {
        const meta = STATUS[a.status] ?? STATUS.draft;
        const latest = a.versions[0];
        return (
          <div key={a.id} className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div>
                <div className="text-sm font-semibold">{a.title}</div>
                {a.description ? <p className="mt-0.5 text-2xs text-muted-foreground">{a.description}</p> : null}
                {a.deadline ? (
                  <p className="mt-1 text-2xs text-muted-foreground">
                    Due {formatDate(a.deadline, { day: "numeric", month: "long" })}
                  </p>
                ) : null}
              </div>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>

            {/* Version history */}
            <div className="divide-y divide-border">
              {a.versions.map((v) => {
                const vm = STATUS[v.status] ?? STATUS.draft;
                return (
                  <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-2xs text-muted-foreground">v{v.version}</span>
                      <span className="text-[13px]">Version {v.version}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={vm.tone}>{vm.label}</Badge>
                      <span className="text-2xs text-muted-foreground">
                        {formatDate(v.createdAt, { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {a.status === "awaiting_approval" && latest ? (
              <div className="border-t border-border p-4">
                <ApprovalActions approvalId={a.id} version={latest.version} title={a.title} demo={demo} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
