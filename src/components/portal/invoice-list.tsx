import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/format";
import type { PortalInvoice } from "@/lib/portal-view";

const TONE: Record<string, Parameters<typeof Badge>[0]["tone"]> = {
  paid: "success",
  overdue: "danger",
  partially_paid: "warning",
  sent: "accent",
  viewed: "accent",
};

export function PortalInvoiceList({ invoices, demo = false }: { invoices: PortalInvoice[]; demo?: boolean }) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center">
        <p className="text-sm font-medium">No invoices yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {invoices.map((inv) => {
        const outstanding = inv.total - inv.amountPaid;
        const payable = !["paid", "cancelled"].includes(inv.status) && outstanding > 0;
        return (
          <div key={inv.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-medium">{inv.number}</span>
                  <Badge tone={TONE[inv.status] ?? "neutral"}>{inv.status.replace("_", " ")}</Badge>
                </div>
                {inv.dueDate ? (
                  <div className="mt-1 text-2xs text-muted-foreground">
                    Due {formatDate(inv.dueDate, { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="text-base font-semibold tabular-nums">{formatMoney(inv.total, inv.currency)}</div>
                {inv.amountPaid > 0 && outstanding > 0 ? (
                  <div className="text-2xs text-muted-foreground">
                    {formatMoney(outstanding, inv.currency)} outstanding
                  </div>
                ) : null}
              </div>
            </div>
            {payable ? (
              demo ? (
                <button
                  disabled
                  title="Disabled in demo"
                  className="mt-3 w-full rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background opacity-60"
                >
                  Pay {formatMoney(outstanding, inv.currency)}
                </button>
              ) : (
                <a
                  href={`/api/portal/invoices/${inv.id}/checkout`}
                  className="mt-3 block w-full rounded-md bg-foreground px-3 py-2 text-center text-[13px] font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Pay {formatMoney(outstanding, inv.currency)}
                </a>
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
