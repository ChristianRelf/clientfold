"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { markInvoicePaid } from "@/lib/invoices";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * Dev-only simulated payment confirmation. Stands in for the Stripe webhook when
 * no keys are configured so the payment loop is fully testable locally. Refuses
 * to run when Stripe IS configured (real payments must go through Stripe).
 */
export async function simulatePaymentAction(formData: FormData): Promise<void> {
  if (isStripeConfigured()) throw new Error("Simulation disabled when Stripe is configured");

  const invoiceId = formData.get("invoiceId");
  if (typeof invoiceId !== "string") return;

  const client = await getPortalClient();
  if (!client) redirect("/portal/enter");

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, select: { clientId: true } });
  if (!invoice || invoice.clientId !== client!.id) redirect("/portal/invoices");

  await markInvoicePaid(invoiceId, { method: "stripe", reference: "dev-simulated" });
  redirect("/portal/invoices?paid=1");
}
