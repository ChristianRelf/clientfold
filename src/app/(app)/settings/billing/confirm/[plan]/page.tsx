import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAppContext } from "@/lib/app";
import { getPlan } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { PageHeader } from "@/components/app/page-header";
import { confirmDevUpgradeAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm upgrade" };

/** Local simulated subscription checkout - dev only (no Stripe keys). */
export default async function ConfirmUpgrade({ params }: { params: Promise<{ plan: string }> }) {
  const { plan: planKey } = await params;
  await getAppContext(); // ensure authenticated + in an org
  if (isStripeConfigured()) redirect(`/api/app/billing/checkout?plan=${planKey}`);

  const plan = getPlan(planKey);
  if (!plan || plan.key === "free") notFound();

  return (
    <div>
      <PageHeader title="Confirm upgrade" description="Review your new plan." />
      <div className="max-w-md p-6">
        <div className="rounded-lg border border-border p-5">
          <div className="mb-3 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-2xs text-warning">
            Test mode - no real charge. This simulates Stripe subscription Checkout locally.
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">ClientFold {plan.name}</span>
            <span className="text-lg font-semibold">
              £{plan.price}
              <span className="text-xs text-muted-foreground">{plan.cadence}</span>
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-2xs text-muted-foreground">
            {plan.features.slice(0, 4).map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <form action={confirmDevUpgradeAction} className="mt-4">
            <input type="hidden" name="plan" value={plan.key} />
            <button className="w-full rounded-md bg-foreground px-3 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">
              Subscribe for £{plan.price}/mo
            </button>
          </form>
          <Link href="/settings/billing" className="mt-3 block text-center text-2xs text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
