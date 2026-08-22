import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { isStripeConfigured } from "@/lib/stripe";
import { formatMoney } from "@/lib/format";
import { Wordmark } from "@/components/brand/logo";
import { simulatePaymentAction } from "./actions";

export const metadata = { title: "Payment", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Local simulated checkout. Only reachable in dev (no Stripe keys) — with keys
 * configured, the checkout route sends clients to real Stripe Checkout instead.
 */
export default async function SimulatedCheckout({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Never expose a fake checkout in a configured (production) environment.
  if (isStripeConfigured()) redirect(`/api/portal/invoices/${id}/checkout`);

  const client = await getPortalClient();
  if (!client) redirect("/portal/enter");

  const invoice = await db.invoice.findUnique({ where: { id }, include: { organisation: true } });
  if (!invoice || invoice.clientId !== client!.id) notFound();
  if (invoice.status === "paid") redirect("/portal/invoices");

  const due = invoice.total - invoice.amountPaid;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Wordmark className="mb-6 text-[15px]" />
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="border-b border-border bg-surface px-5 py-4">
          <div className="text-2xs uppercase tracking-wide text-muted-foreground">Pay {invoice.organisation.name}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(due, invoice.currency)}</div>
          <div className="mt-0.5 text-2xs text-muted-foreground">{invoice.number}</div>
        </div>
        <div className="p-5">
          <div className="mb-4 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-2xs text-warning">
            Test mode — no real payment is taken. This simulates Stripe Checkout locally.
          </div>
          <form action={simulatePaymentAction}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <button className="w-full rounded-md bg-foreground px-3 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
              Pay {formatMoney(due, invoice.currency)}
            </button>
          </form>
          <Link
            href="/portal/invoices"
            className="mt-3 block text-center text-2xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </div>
      <p className="mt-6 text-2xs text-muted-foreground">Secured by ClientFold · Powered by Stripe</p>
    </div>
  );
}
