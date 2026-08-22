import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { getPlan } from "@/lib/pricing";
import { createSubscriptionCheckoutUrl } from "@/lib/stripe";
import { trackEvent } from "@/lib/marketing/events";

/**
 * Begin a plan upgrade. Owners/admins only. Redirects to Stripe subscription
 * Checkout (or the dev simulation). Downgrades to Free are handled by a separate
 * cancel action, not checkout.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    return NextResponse.json({ error: "Owners and admins only" }, { status: 403 });
  }

  const url = new URL(request.url);
  const planKey = url.searchParams.get("plan") ?? "";
  const plan = getPlan(planKey);
  if (!plan || plan.key === "free") {
    return NextResponse.redirect(new URL("/settings/billing", request.url));
  }

  const org = await db.organisation.findUnique({
    where: { id: ctx.org.id },
    select: { billingEmail: true, currency: true },
  });

  await trackEvent("subscription.checkout_started", { userId: ctx.user.id, organisationId: ctx.org.id }, {
    plan: plan.key,
  });

  const checkoutUrl = await createSubscriptionCheckoutUrl({
    organisationId: ctx.org.id,
    plan: plan.key,
    planName: plan.name,
    priceMinor: plan.price * 100,
    currency: org?.currency ?? "GBP",
    customerEmail: org?.billingEmail ?? ctx.user.email,
  });

  return NextResponse.redirect(new URL(checkoutUrl, request.url));
}
