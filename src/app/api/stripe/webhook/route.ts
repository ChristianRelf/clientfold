import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { markInvoicePaid } from "@/lib/invoices";
import { applyPlanChange } from "@/lib/subscriptions";

/**
 * Stripe webhook. Verifies the signature manually (same scheme the Stripe SDK
 * uses) so we don't need the SDK on the edge of this build. Never trust the
 * payload until the signature checks out. Idempotency: handlers are written to
 * be safe to re-run.
 */
export const runtime = "nodejs";

const TOLERANCE_SECONDS = 60 * 5;

function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject stale timestamps (replay protection).
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!verifyStripeSignature(payload, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.payment_succeeded": {
        const obj = event.data.object;
        // We put invoiceId in metadata / client_reference_id when creating the
        // Checkout Session; fall back to a stored payment-intent id.
        const metadata = (obj["metadata"] as Record<string, string> | undefined) ?? {};

        // Plan upgrade (subscription Checkout) - has plan + organisationId.
        if (metadata.plan && metadata.organisationId) {
          await applyPlanChange(metadata.organisationId, metadata.plan, {
            stripeCustomerId: obj["customer"] as string | undefined,
            stripeSubscriptionId: obj["subscription"] as string | undefined,
            status: "active",
          });
          break;
        }

        const invoiceId = metadata.invoiceId ?? (obj["client_reference_id"] as string | undefined);
        const paymentIntentId = obj["payment_intent"] as string | undefined;

        let invoiceRowId: string | null = invoiceId ?? null;
        if (!invoiceRowId && paymentIntentId) {
          const found = await db.invoice.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
            select: { id: true },
          });
          invoiceRowId = found?.id ?? null;
        }
        if (invoiceRowId) {
          await markInvoicePaid(invoiceRowId, { method: "stripe", stripeChargeId: paymentIntentId });
        }
        break;
      }
      case "account.updated": {
        // Stripe Connect onboarding progress.
        const acct = event.data.object;
        const acctId = acct["id"] as string | undefined;
        const chargesEnabled = Boolean(acct["charges_enabled"]);
        if (acctId) {
          await db.organisation.updateMany({
            where: { stripeConnectId: acctId },
            data: { stripeConnectComplete: chargesEnabled },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const obj = event.data.object;
        const customerId = obj["customer"] as string | undefined;
        const status = obj["status"] as string | undefined;
        if (customerId) {
          await db.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: status ?? "active" },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const customerId = event.data.object["customer"] as string | undefined;
        if (customerId) {
          await db.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "canceled" },
          });
        }
        break;
      }
    }
  } catch {
    // Return 200 so Stripe doesn't hammer retries for a handler bug; log in prod.
    return NextResponse.json({ received: true, handled: false });
  }

  return NextResponse.json({ received: true });
}
