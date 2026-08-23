import Link from "next/link";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { isAutopilotPlan } from "@/lib/autopilot";
import { toggleAutomaticRemindersAction } from "./actions";

export const metadata = { title: "Notification settings" };
export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const ctx = await getAppContext();
  const [org, activeItems] = await Promise.all([
    db.organisation.findUnique({ where: { id: ctx.org.id }, select: { automaticRemindersEnabled: true, timezone: true } }),
    db.waitingItem.count({ where: { organisationId: ctx.org.id, status: "waiting", automaticReminderState: "inherit", automaticReminderStep: { lt: 2 } } }),
  ]);
  if (!org) return null;
  const eligible = isAutopilotPlan(ctx.org.plan);
  const canManage = ["owner", "admin"].includes(ctx.role);

  return (
    <div>
      <PageHeader title="Notifications" description="Decide when ClientFold follows up on your behalf." />
      <div className="max-w-3xl p-6">
        <section className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="flex flex-col justify-between gap-5 border-b border-border bg-surface p-5 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-waiting" /><h2 className="text-base font-semibold">Follow-up Autopilot</h2></div>
              <p className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">ClientFold sends one polite reminder after 3 days and a final reminder after 7 days. It stops the moment your client acts.</p>
            </div>
            {eligible ? (
              <form action={toggleAutomaticRemindersAction}>
                <input type="hidden" name="enabled" value={org.automaticRemindersEnabled ? "false" : "true"} />
                <button disabled={!canManage} className={`min-w-24 rounded-md px-4 py-2 text-xs font-semibold ${org.automaticRemindersEnabled ? "border border-border bg-background text-foreground" : "bg-foreground text-background"}`}>{org.automaticRemindersEnabled ? "Turn off" : "Turn on"}</button>
              </form>
            ) : <Link href="/settings/billing" className="rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background">Upgrade to Solo</Link>}
          </div>
          <div className="grid sm:grid-cols-3">
            <Setting label="Schedule" value="Day 3 and day 7" />
            <Setting label="Send time" value={`10:00 · ${org.timezone}`} />
            <Setting label="Active follow-ups" value={org.automaticRemindersEnabled ? String(activeItems) : "Off"} />
          </div>
          <div className="border-t border-border px-5 py-4 text-xs leading-5 text-muted-foreground">Weekends roll forward to Monday. You can pause individual items or send a manual reminder from the Waiting Room at any time.</div>
        </section>
      </div>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-2xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium">{value}</p></div>;
}
