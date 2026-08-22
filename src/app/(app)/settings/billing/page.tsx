import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { PLANS, getPlan } from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cancelPlanAction } from "./actions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

const RANK: Record<string, number> = { free: 0, solo: 1, studio: 2, agency: 3 };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; canceled?: string }>;
}) {
  const ctx = await getAppContext();
  const { upgraded, canceled } = await searchParams;

  const org = await db.organisation.findUnique({
    where: { id: ctx.org.id },
    include: { subscription: true },
  });
  const currentPlan = org?.plan ?? "free";
  const current = getPlan(currentPlan);
  const canManage = ctx.role === "owner" || ctx.role === "admin";

  return (
    <div>
      <PageHeader title="Billing" description="Manage your ClientFold subscription." />
      <div className="max-w-3xl space-y-6 p-6">
        {upgraded ? (
          <div className="rounded-md border border-success/30 bg-success/5 px-4 py-3 text-[13px] text-success">
            You&apos;re now on the {getPlan(upgraded)?.name ?? upgraded} plan. Thanks for upgrading!
          </div>
        ) : null}
        {canceled ? (
          <div className="rounded-md border border-border bg-surface px-4 py-3 text-[13px] text-muted-foreground">
            Your subscription was cancelled. You&apos;re back on the Free plan.
          </div>
        ) : null}

        {/* Current plan */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase tracking-wide text-muted-foreground">Current plan</div>
              <div className="mt-0.5 text-lg font-semibold">{current?.name ?? currentPlan}</div>
            </div>
            <Badge tone={org?.subscription?.status === "active" && currentPlan !== "free" ? "success" : "neutral"}>
              {currentPlan === "free" ? "Free" : org?.subscription?.status ?? "active"}
            </Badge>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isUpgrade = RANK[plan.key] > RANK[currentPlan];
            return (
              <div
                key={plan.key}
                className={cn(
                  "flex flex-col rounded-lg border p-4",
                  isCurrent ? "border-accent/40 ring-1 ring-accent/20" : "border-border",
                )}
              >
                <div className="text-sm font-semibold">{plan.name}</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tracking-tight">£{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </div>
                <p className="mt-1 text-2xs text-muted-foreground">{plan.tagline}</p>
                <div className="mt-3">
                  {isCurrent ? (
                    <span className="inline-block rounded-md bg-muted px-3 py-1.5 text-2xs font-medium text-muted-foreground">
                      Current plan
                    </span>
                  ) : isUpgrade && canManage ? (
                    <ButtonLink href={`/api/app/billing/checkout?plan=${plan.key}`} size="sm" className="w-full">
                      Upgrade
                    </ButtonLink>
                  ) : plan.key === "free" && currentPlan !== "free" && canManage ? (
                    <form action={cancelPlanAction}>
                      <button className="w-full rounded-md border border-border px-3 py-1.5 text-2xs font-medium hover:bg-muted">
                        Downgrade to Free
                      </button>
                    </form>
                  ) : (
                    <span className="text-2xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!canManage ? (
          <p className="text-2xs text-muted-foreground">Only owners and admins can change the plan.</p>
        ) : null}
      </div>
    </div>
  );
}
