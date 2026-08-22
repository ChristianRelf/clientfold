"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAppContext } from "@/lib/app";
import { requireOrg, assertRole } from "@/lib/tenancy";
import { applyPlanChange } from "@/lib/subscriptions";
import { isStripeConfigured } from "@/lib/stripe";
import { getPlan as getPricingPlan } from "@/lib/pricing";

/** Cancel the paid plan and move back to Free. Owners/admins only. */
export async function cancelPlanAction(): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  await applyPlanChange(ctx.org.id, "free", { status: "canceled" });
  revalidatePath("/settings/billing");
  redirect("/settings/billing?canceled=1");
}

/** Dev-only simulated upgrade confirmation. Refuses when Stripe is configured. */
export async function confirmDevUpgradeAction(formData: FormData): Promise<void> {
  if (isStripeConfigured()) throw new Error("Simulation disabled when Stripe is configured");
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");

  const plan = formData.get("plan");
  if (typeof plan !== "string" || !getPricingPlan(plan)) redirect("/settings/billing");
  await applyPlanChange(ctx.org.id, plan as string, { status: "active" });
  redirect(`/settings/billing?upgraded=${plan}`);
}
