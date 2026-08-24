import { db } from "@/lib/db";
import { createClientInvitation } from "@/lib/auth/invitations";
import { isEmailConfigured, sendReminderEmail } from "@/lib/email";
import { isAutopilotPlan, REMINDER_ACTION_LABEL, scheduleAfterLocalDays, scheduleForStep, type ReminderJobResult } from "@/lib/autopilot";
import { trackEvent } from "@/lib/marketing/events";

const LOCK_MINUTES = 20;

async function reminderAnchor(item: { sourceType: string; sourceId: string; requestedAt: Date }): Promise<Date> {
  if (item.sourceType === "approval") {
    const source = await db.approval.findUnique({ where: { id: item.sourceId }, select: { deadline: true, requestedAt: true } }).catch(() => null);
    return source?.deadline ?? source?.requestedAt ?? item.requestedAt;
  }
  if (item.sourceType === "file_request") {
    const source = await db.fileRequest.findUnique({ where: { id: item.sourceId }, select: { dueDate: true, createdAt: true } }).catch(() => null);
    return source?.dueDate ?? source?.createdAt ?? item.requestedAt;
  }
  if (item.sourceType === "payment") {
    const source = await db.invoice.findFirst({ where: { OR: [{ id: item.sourceId }, { number: item.sourceId }] }, select: { dueDate: true, issueDate: true } }).catch(() => null);
    return source?.dueDate ?? source?.issueDate ?? item.requestedAt;
  }
  if (item.sourceType === "task") {
    const source = await db.task.findUnique({ where: { id: item.sourceId }, select: { dueDate: true, createdAt: true } }).catch(() => null);
    return source?.dueDate ?? source?.createdAt ?? item.requestedAt;
  }
  return item.requestedAt;
}

async function initialiseSchedules(now: Date) {
  const unscheduled = await db.waitingItem.findMany({
    where: {
      status: "waiting",
      automaticReminderState: "inherit",
      automaticReminderStep: { lt: 2 },
      nextAutomaticReminderAt: null,
      organisation: { automaticRemindersEnabled: true, plan: { in: ["solo", "studio", "agency"] } },
      clientId: { not: null },
    },
    include: { organisation: { select: { timezone: true } } },
    take: 100,
  });
  for (const item of unscheduled) {
    const step = (item.automaticReminderStep + 1) as 1 | 2;
    const anchor = await reminderAnchor(item);
    const calculated = scheduleForStep(anchor, step, item.organisation.timezone).scheduledFor;
    const scheduledFor = calculated <= now ? scheduleAfterLocalDays(now, step === 1 ? 1 : 4, item.organisation.timezone) : calculated;
    await db.waitingItem.update({ where: { id: item.id }, data: { nextAutomaticReminderAt: scheduledFor } });
  }
}

export async function runAutomaticReminderJob(limit = 50, now = new Date()): Promise<ReminderJobResult> {
  const result: ReminderJobResult = { scanned: 0, sent: 0, skipped: 0, failed: 0 };
  if (process.env.AUTOMATIC_REMINDERS_ENABLED !== "true" || !isEmailConfigured()) return result;
  await initialiseSchedules(now);
  const lockExpiredBefore = new Date(now.getTime() - LOCK_MINUTES * 60_000);
  const due = await db.waitingItem.findMany({
    where: {
      status: "waiting",
      automaticReminderState: "inherit",
      automaticReminderStep: { lt: 2 },
      nextAutomaticReminderAt: { lte: now },
      clientId: { not: null },
      organisation: { automaticRemindersEnabled: true, plan: { in: ["solo", "studio", "agency"] } },
      OR: [{ automaticReminderClaimedAt: null }, { automaticReminderClaimedAt: { lt: lockExpiredBefore } }],
    },
    orderBy: { nextAutomaticReminderAt: "asc" },
    take: Math.max(1, Math.min(limit, 100)),
    include: {
      client: true,
      project: { include: { marketplaceLinks: { where: { engagementMode: "marketplace_only" }, select: { id: true }, take: 1 } } },
      organisation: { include: { members: { where: { role: "owner" }, include: { user: { select: { email: true } } }, take: 1 } } },
    },
  });
  result.scanned = due.length;

  for (const item of due) {
    if (item.project?.marketplaceLinks.length) {
      await db.waitingItem.update({
        where: { id: item.id },
        data: { automaticReminderState: "paused", nextAutomaticReminderAt: null, automaticReminderClaimedAt: null },
      });
      result.skipped += 1;
      continue;
    }
    const claimed = await db.waitingItem.updateMany({
      where: { id: item.id, status: "waiting", automaticReminderState: "inherit", nextAutomaticReminderAt: { lte: now }, OR: [{ automaticReminderClaimedAt: null }, { automaticReminderClaimedAt: { lt: lockExpiredBefore } }] },
      data: { automaticReminderClaimedAt: now },
    });
    if (
      claimed.count !== 1
      || !item.client?.email
      || !item.organisation.automaticRemindersEnabled
      || !isAutopilotPlan(item.organisation.plan)
    ) {
      result.skipped += 1;
      continue;
    }
    const step = (item.automaticReminderStep + 1) as 1 | 2;
    const idempotencyKey = `automatic-reminder/${item.id}/${step}`;
    const existing = await db.reminder.findUnique({ where: { idempotencyKey } });
    if (existing?.status === "sent") {
      const anchor = await reminderAnchor(item);
      const calculatedNext = step === 1 ? scheduleForStep(anchor, 2, item.organisation.timezone).scheduledFor : null;
      const nextAutomaticReminderAt = calculatedNext && calculatedNext <= now ? scheduleAfterLocalDays(now, 4, item.organisation.timezone) : calculatedNext;
      await db.waitingItem.update({ where: { id: item.id }, data: { automaticReminderStep: step, nextAutomaticReminderAt, automaticReminderClaimedAt: null } });
      result.skipped += 1;
      continue;
    }
    const reminder = existing ?? await db.reminder.create({ data: { waitingItemId: item.id, channel: "email", automatic: true, status: "processing", scheduledFor: item.nextAutomaticReminderAt, idempotencyKey } });
    if (existing) await db.reminder.update({ where: { id: existing.id }, data: { status: "processing", failureReason: null } });

    try {
      const invite = await createClientInvitation({ organisationId: item.organisationId, clientId: item.client.id, email: item.client.email });
      const delivery = await sendReminderEmail(item.client.email, invite.url, {
        orgName: item.organisation.name,
        projectName: item.project?.name ?? "your project",
        itemTitle: item.title,
        action: REMINDER_ACTION_LABEL[item.type] ?? "Open your portal",
        clientName: item.client.name,
        automatic: true,
        idempotencyKey,
        replyTo: item.organisation.members[0]?.user.email ?? item.organisation.billingEmail ?? undefined,
      });
      if (!delivery.accepted) throw new Error(delivery.errorCode ?? "delivery_failed");
      const anchor = await reminderAnchor(item);
      const calculatedNext = step === 1 ? scheduleForStep(anchor, 2, item.organisation.timezone).scheduledFor : null;
      const nextAutomaticReminderAt = calculatedNext && calculatedNext <= now ? scheduleAfterLocalDays(now, 4, item.organisation.timezone) : calculatedNext;
      await db.$transaction([
        db.reminder.update({ where: { id: reminder.id }, data: { status: "sent", sentAt: now, providerId: delivery.providerId } }),
        db.waitingItem.update({ where: { id: item.id }, data: { automaticReminderStep: step, automaticReminderClaimedAt: null, nextAutomaticReminderAt, lastRemindedAt: now, reminderCount: { increment: 1 } } }),
        db.activity.create({ data: { organisationId: item.organisationId, projectId: item.projectId, type: "reminder.automatic_sent", actorType: "system", actorName: "ClientFold Autopilot", summary: `ClientFold sent an automatic reminder for ${item.title}` } }),
      ]);
      await trackEvent("reminder.automatic_sent", { organisationId: item.organisationId }, { type: item.type });
      result.sent += 1;
    } catch (error) {
      const failureReason = error instanceof Error ? error.message.slice(0, 120) : "unknown_error";
      await db.$transaction([
        db.reminder.update({ where: { id: reminder.id }, data: { status: "failed", failureReason } }),
        db.waitingItem.update({ where: { id: item.id }, data: { automaticReminderClaimedAt: null, nextAutomaticReminderAt: new Date(now.getTime() + 6 * 60 * 60 * 1000) } }),
      ]);
      await trackEvent("reminder.automatic_failed", { organisationId: item.organisationId }, { type: item.type });
      result.failed += 1;
    }
  }
  return result;
}
