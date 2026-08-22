"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { assertRole, requireOrg } from "@/lib/tenancy";
import { isStripeConfigured, createConnectOnboardingUrl } from "@/lib/stripe";

/**
 * Start (or resume) Stripe Connect onboarding for the organisation. Owners/admins
 * only. In production this creates a connected account + onboarding link and
 * redirects to Stripe; in dev (no keys) it marks a simulated connected account so
 * the payment flow is exercisable.
 */
export async function connectStripeAction(): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");

  const org = await db.organisation.findUnique({
    where: { id: ctx.org.id },
    select: { stripeConnectId: true, billingEmail: true },
  });

  if (!isStripeConfigured()) {
    // Dev simulation — pretend onboarding completed.
    await db.organisation.update({
      where: { id: ctx.org.id },
      data: { stripeConnectId: org?.stripeConnectId ?? `acct_dev_${ctx.org.id.slice(0, 8)}`, stripeConnectComplete: true },
    });
    revalidatePath("/settings");
    redirect("/settings?connected=dev");
  }

  const { accountId, url } = await createConnectOnboardingUrl({
    organisationId: ctx.org.id,
    existingAccountId: org?.stripeConnectId ?? null,
    email: org?.billingEmail,
    returnPath: "/settings",
  });
  await db.organisation.update({ where: { id: ctx.org.id }, data: { stripeConnectId: accountId } });
  redirect(url);
}
