import { db } from "@/lib/db";
import { trackEvent } from "@/lib/marketing/events";
import { notifyMembers } from "@/lib/notifications";

/**
 * Single source of truth for marking an invoice paid — called by the Stripe
 * webhook AND the dev simulation, so both paths behave identically. Idempotent:
 * a second call on an already-paid invoice is a no-op. Records a Payment,
 * resolves the matching Waiting item, and logs activity.
 */
export async function markInvoicePaid(
  invoiceId: string,
  opts: { method?: string; reference?: string; stripeChargeId?: string; amount?: number } = {},
): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { client: true } });
  if (!invoice) return { ok: false };
  if (invoice.status === "paid") return { ok: true, alreadyPaid: true };

  const amount = opts.amount ?? invoice.total - invoice.amountPaid;

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount,
        method: opts.method ?? "stripe",
        reference: opts.reference,
        stripeChargeId: opts.stripeChargeId,
      },
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "paid", paidAt: new Date(), amountPaid: invoice.total },
    });
    // Resolve the Waiting Room payment item (sourceId is the invoice number).
    await tx.waitingItem.updateMany({
      where: { organisationId: invoice.organisationId, type: "payment", sourceId: invoice.number, status: "waiting" },
      data: { status: "resolved", resolvedAt: new Date() },
    });
    await tx.activity.create({
      data: {
        organisationId: invoice.organisationId,
        projectId: invoice.projectId,
        type: "invoice.paid",
        actorType: "system",
        actorName: invoice.client?.name ?? "Client",
        summary: `${invoice.number} was paid`,
      },
    });
  });

  await trackEvent("invoice.paid", { organisationId: invoice.organisationId }, {
    value: invoice.total,
    currency: invoice.currency,
  });
  await notifyMembers({ organisationId: invoice.organisationId, type: "invoice.paid", title: `${invoice.number} was paid`, body: invoice.client?.name ?? null, href: "/invoices" });
  return { ok: true };
}

/** Mark an invoice viewed (first time the client opens it). */
export async function markInvoiceViewed(invoiceId: string): Promise<void> {
  try {
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, select: { status: true, viewedAt: true } });
    if (!invoice || invoice.viewedAt) return;
    const nextStatus = invoice.status === "sent" ? "viewed" : invoice.status;
    await db.invoice.update({ where: { id: invoiceId }, data: { viewedAt: new Date(), status: nextStatus } });
  } catch {
    /* noop */
  }
}
