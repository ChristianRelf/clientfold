"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { isAutopilotPlan, scheduleStaleFirstReminder } from "@/lib/autopilot";

export async function toggleAutomaticRemindersAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  if (!isAutopilotPlan(ctx.org.plan) || !["owner", "admin"].includes(ctx.role)) return;
  const enabled = formData.get("enabled") === "true";
  const org = await db.organisation.findUnique({ where: { id: ctx.org.id }, select: { timezone: true } });
  if (!org) return;

  await db.$transaction(async (tx) => {
    await tx.organisation.update({ where: { id: ctx.org.id }, data: { automaticRemindersEnabled: enabled } });
    if (!enabled) {
      await tx.waitingItem.updateMany({ where: { organisationId: ctx.org.id, status: "waiting" }, data: { automaticReminderClaimedAt: null } });
      return;
    }
    const stale = await tx.waitingItem.findMany({
      where: { organisationId: ctx.org.id, status: "waiting", automaticReminderState: "inherit", automaticReminderStep: { lt: 2 }, nextAutomaticReminderAt: null },
      select: { id: true },
    });
    const scheduledFor = scheduleStaleFirstReminder(new Date(), org.timezone).scheduledFor;
    await Promise.all(stale.map((item) => tx.waitingItem.update({ where: { id: item.id }, data: { nextAutomaticReminderAt: scheduledFor } })));
  });
  revalidatePath("/settings/notifications");
  revalidatePath("/waiting");
}
