import { db } from "@/lib/db";
import { trackEvent } from "@/lib/marketing/events";
import { getPlan } from "@/lib/pricing";
import { markReferralPaid } from "@/lib/marketing/referrals";
import { notifyMembers } from "@/lib/notifications";

/**
 * Single source of truth for applying a plan change — called by both the Stripe
 * webhook and the dev simulation so they behave identically. Updates the org +
 * subscription, records activity, and emits the right growth event (started for
 * free→paid, upgraded for paid→paid).
 */
export async function applyPlanChange(
  organisationId: string,
  plan: string,
  opts: { stripeCustomerId?: string; stripeSubscriptionId?: string; status?: string } = {},
): Promise<{ ok: boolean }> {
  const org = await db.organisation.findUnique({
    where: { id: organisationId },
    include: { subscription: true },
  });
  if (!org) return { ok: false };
  if (!getPlan(plan)) return { ok: false };

  const previous = org.plan;
  if (previous === plan && !opts.status) return { ok: true };

  await db.$transaction(async (tx) => {
    await tx.organisation.update({ where: { id: organisationId }, data: { plan } });
    await tx.subscription.upsert({
      where: { organisationId },
      create: {
        organisationId,
        plan,
        status: opts.status ?? "active",
        stripeCustomerId: opts.stripeCustomerId,
        stripeSubscriptionId: opts.stripeSubscriptionId,
      },
      update: {
        plan,
        status: opts.status ?? "active",
        stripeCustomerId: opts.stripeCustomerId ?? org.subscription?.stripeCustomerId,
        stripeSubscriptionId: opts.stripeSubscriptionId ?? org.subscription?.stripeSubscriptionId,
      },
    });
    await tx.activity.create({
      data: {
        organisationId,
        type: plan === "free" ? "subscription.cancelled" : "subscription.changed",
        actorType: "system",
        actorName: "Billing",
        summary:
          plan === "free"
            ? "Subscription cancelled — moved to Free"
            : `Plan changed to ${getPlan(plan)?.name ?? plan}`,
      },
    });
  });

  if (plan === "free") {
    await trackEvent("subscription.cancelled", { organisationId }, { fromPlan: previous });
  } else if (previous === "free") {
    await markReferralPaid(organisationId);
    await trackEvent("subscription.started", { organisationId }, { plan });
  } else {
    await trackEvent("subscription.upgraded", { organisationId }, { fromPlan: previous, toPlan: plan });
  }
  await notifyMembers({ organisationId, roles: ["owner", "admin"], type: "subscription.changed", title: plan === "free" ? "Subscription moved to Free" : `Plan changed to ${getPlan(plan)?.name ?? plan}`, href: "/settings/billing" });
  return { ok: true };
}
