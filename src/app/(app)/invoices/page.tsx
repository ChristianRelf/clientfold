import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = { title: "Invoices" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, Parameters<typeof Badge>[0]["tone"]> = {
  draft: "neutral",
  sent: "accent",
  viewed: "accent",
  paid: "success",
  partially_paid: "warning",
  overdue: "danger",
  cancelled: "neutral",
};

export default async function InvoicesPage() {
  const ctx = await getAppContext();
  const invoices = await db.invoice.findMany({
    where: { organisationId: ctx.org.id },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const outstanding = invoices
    .filter((invoice) => ["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.total - invoice.amountPaid, 0);

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader title="Invoices" description={`${formatMoney(outstanding, ctx.org.currency)} outstanding`} actions={<Button size="sm">New invoice</Button>} />
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <div className="hidden grid-cols-[auto_1.4fr_1fr_auto_auto] gap-4 border-b border-border bg-surface px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>Number</span><span>Client</span><span>Due</span><span className="text-right">Status</span><span className="text-right">Total</span>
          </div>
          {invoices.length === 0 ? (
            <div className="px-4 py-16 text-center text-[13px] text-muted-foreground">No invoices yet.</div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 hairline md:grid-cols-[auto_1.4fr_1fr_auto_auto] md:gap-4 md:py-3">
                <span className="col-start-1 row-start-1 font-mono text-[13px] font-medium md:col-auto md:row-auto">{invoice.number}</span>
                <span className="col-start-1 row-start-2 truncate text-xs text-muted-foreground md:col-auto md:row-auto md:text-[13px] md:text-foreground">{invoice.client?.company ?? "-"}</span>
                <span className="hidden text-[13px] text-muted-foreground md:block">{invoice.dueDate ? formatDate(invoice.dueDate, { day: "numeric", month: "short" }) : "-"}</span>
                <span className="col-start-2 row-start-1 text-right md:col-auto md:row-auto"><Badge tone={STATUS_TONE[invoice.status] ?? "neutral"}>{invoice.status.replace("_", " ")}</Badge></span>
                <span className="col-start-2 row-start-2 text-right font-mono text-[13px] md:col-auto md:row-auto">{formatMoney(invoice.total, invoice.currency)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
