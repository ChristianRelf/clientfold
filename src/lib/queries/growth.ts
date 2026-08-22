import { db } from "@/lib/db";

/**
 * Growth reporting. Builds the acquisition → activation → revenue funnel from
 * first-party events and org state. This is deliberately honest: counts of real
 * rows, no statistically misleading confidence theatre.
 */

export type FunnelStage = { key: string; label: string; count: number };

export async function getFunnel(): Promise<FunnelStage[]> {
  const [signupStarted, signupCompleted, orgs, firstProject, clientInvited, activated, paid] =
    await Promise.all([
      db.marketingEvent.count({ where: { name: "auth.signup_started" } }),
      db.marketingEvent.count({ where: { name: "auth.signup_completed" } }),
      db.organisation.count(),
      db.project.groupBy({ by: ["organisationId"], _count: true }).then((r) => r.length),
      db.invitation.groupBy({ by: ["organisationId"] }).then((r) => r.length),
      db.organisation.count({ where: { activatedAt: { not: null } } }),
      db.subscription.count({ where: { plan: { not: "free" }, status: "active" } }),
    ]);

  return [
    { key: "signup_started", label: "Signup started", count: signupStarted },
    { key: "signup_completed", label: "Signup completed", count: signupCompleted },
    { key: "org_created", label: "Organisation created", count: orgs },
    { key: "first_project", label: "First project", count: firstProject },
    { key: "client_invited", label: "First client invited", count: clientInvited },
    { key: "activated", label: "Activated", count: activated },
    { key: "paid", label: "Paid conversion", count: paid },
  ];
}

export type SourceRow = { source: string; visitors: number; signups: number };

export async function getAcquisitionBySource(): Promise<SourceRow[]> {
  const pageViews = await db.marketingEvent.groupBy({
    by: ["source"],
    where: { name: "marketing.page_view" },
    _count: true,
  });
  const signups = await db.marketingEvent.groupBy({
    by: ["source"],
    where: { name: "auth.signup_completed" },
    _count: true,
  });
  const signupMap = new Map(signups.map((s) => [s.source ?? "direct", s._count]));

  const rows = pageViews.map((p) => ({
    source: p.source ?? "direct",
    visitors: p._count,
    signups: signupMap.get(p.source ?? "direct") ?? 0,
  }));

  // Ensure sources that only have signups still appear.
  for (const s of signups) {
    const key = s.source ?? "direct";
    if (!rows.find((r) => r.source === key)) rows.push({ source: key, visitors: 0, signups: s._count });
  }
  return rows.sort((a, b) => b.visitors - a.visitors);
}

export async function getRevenueSummary() {
  const paidSubs = await db.subscription.findMany({
    where: { plan: { not: "free" }, status: "active" },
    select: { plan: true, attributionSource: true },
  });
  const bySource = new Map<string, number>();
  for (const s of paidSubs) {
    const key = s.attributionSource ?? "unknown";
    bySource.set(key, (bySource.get(key) ?? 0) + 1);
  }
  return {
    paidCount: paidSubs.length,
    bySource: Array.from(bySource.entries()).map(([source, count]) => ({ source, count })),
  };
}
