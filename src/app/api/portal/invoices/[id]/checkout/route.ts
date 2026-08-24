import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { createInvoiceCheckoutUrl } from "@/lib/stripe";
import { trackEvent } from "@/lib/marketing/events";

/**
 * Start payment for an invoice from the portal. Verifies the client owns the
 * invoice, then redirects to Stripe Checkout (on the org's connected account) —
 * or, in dev without keys, to the local simulated checkout page.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getPortalClient();
  if (!client) return NextResponse.redirect(new URL("/portal/enter", request.url));

  const invoice = await db.invoice.findUnique({ where: { id }, include: { organisation: true, project: { include: { marketplaceLinks: { where: { engagementMode: "marketplace_only" }, select: { id: true }, take: 1 } } } } });
  if (!invoice || invoice.clientId !== client.id || invoice.project?.marketplaceLinks.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (invoice.status === "paid") {
    return NextResponse.redirect(new URL("/portal/invoices", request.url));
  }

  await trackEvent("subscription.checkout_started", { organisationId: invoice.organisationId }, {
    type: "invoice",
    value: invoice.total,
    currency: invoice.currency,
  });

  const url = await createInvoiceCheckoutUrl({
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    currency: invoice.currency,
    amount: invoice.total - invoice.amountPaid,
    description: `${invoice.organisation.name} · ${invoice.number}`,
    connectedAccount: invoice.organisation.stripeConnectComplete ? invoice.organisation.stripeConnectId : null,
  });

  return NextResponse.redirect(new URL(url, request.url));
}
