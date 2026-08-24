import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { ReferralLink } from "@/components/app/referral-link";

export const metadata = { title: "Referrals" };
export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const ctx = await getAppContext();
  const organisation = await db.organisation.findUnique({ where: { id: ctx.org.id }, select: { referralCode: true } });
  if (!organisation) return null;
  const rows = await db.referral.findMany({ where: { referrerType: "organisation", referrerId: ctx.org.id }, orderBy: { createdAt: "desc" } });
  const link = `${process.env.APP_URL ?? "http://localhost:3000"}/waitlist?ref=${organisation.referralCode.slice(0, 8)}`;
  const stats = [
    ["Referred", rows.length],
    ["Signed up", rows.filter((row) => row.signedUpAt).length],
    ["Activated", rows.filter((row) => row.activatedAt).length],
    ["Paid", rows.filter((row) => row.paidAt).length],
  ] as const;
  return <div><PageHeader title="Referrals" description="Track the people and teams you introduce to ClientFold." /><div className="max-w-4xl space-y-6 p-6"><div className="rounded-lg border border-border p-4"><div className="text-[12px] font-semibold">Your referral link</div><ReferralLink value={link} /></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded-lg border border-border p-4"><div className="text-2xl font-semibold tabular-nums">{value}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div></div>)}</div><div className="overflow-hidden rounded-lg border border-border"><div className="border-b border-border bg-surface px-4 py-3 text-[12px] font-semibold">Recent referrals</div>{rows.length ? rows.map((row) => <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-4 py-3 text-[12px] last:border-0"><span className="truncate">{row.waitlistEmail ?? "Anonymous referral"}</span><span className="text-[10px] text-muted-foreground">{row.paidAt ? "Paid" : row.activatedAt ? "Activated" : row.signedUpAt ? "Signed up" : "Waitlisted"}</span></div>) : <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">No referrals captured yet.</div>}</div></div></div>;
}
