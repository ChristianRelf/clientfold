"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { createClientInvitation } from "@/lib/auth/invitations";
import { sendReminderEmail } from "@/lib/email";
import { postponeAfterManualReminder, REMINDER_ACTION_LABEL } from "@/lib/autopilot";

export type RemindResult = { ok: true; sent: boolean } | { ok: false; error: string };
const COOLDOWN_HOURS = 24;

export async function sendReminderAction(waitingItemId: string): Promise<RemindResult> {
  const ctx = await getAppContext();
  const item = await db.waitingItem.findFirst({
    where: { id: waitingItemId, organisationId: ctx.org.id },
    include: {
      client: true,
      project: { include: { marketplaceLinks: { where: { engagementMode: "marketplace_only" }, select: { id: true }, take: 1 } } },
      organisation: true,
    },
  });
  if (!item) return { ok: false, error: "Item not found" };
  if (item.status !== "waiting") return { ok: false, error: "This item is already resolved" };
  if (item.lastRemindedAt) {
    const hoursSince = (Date.now() - item.lastRemindedAt.getTime()) / 3_600_000;
    if (hoursSince < COOLDOWN_HOURS) return { ok: false, error: `Already reminded recently. Try again in ${Math.ceil(COOLDOWN_HOURS - hoursSince)}h.` };
  }
  if (!item.client?.email) return { ok: false, error: "This client has no portal email address" };
  if (item.project?.marketplaceLinks.length) {
    return { ok: false, error: "Marketplace buyers must be contacted on the marketplace" };
  }

  const now = new Date();
  const idempotencyKey = `manual-reminder/${item.id}/${randomUUID()}`;
  const reminder = await db.reminder.create({
    data: { waitingItemId: item.id, channel: "email", automatic: false, status: "processing", idempotencyKey },
  });
  const invite = await createClientInvitation({ organisationId: ctx.org.id, clientId: item.client.id, email: item.client.email });
  const delivery = await sendReminderEmail(item.client.email, invite.url, {
    orgName: item.organisation.name,
    projectName: item.project?.name ?? "your project",
    itemTitle: item.title,
    action: REMINDER_ACTION_LABEL[item.type] ?? "Open your portal",
    clientName: item.client.name,
    idempotencyKey,
    replyTo: ctx.user.email,
  });

  await db.$transaction([
    db.reminder.update({
      where: { id: reminder.id },
      data: { status: delivery.accepted ? "sent" : "failed", sentAt: delivery.accepted ? now : null, providerId: delivery.providerId, failureReason: delivery.errorCode },
    }),
    db.waitingItem.update({
      where: { id: item.id },
      data: {
        lastRemindedAt: now,
        reminderCount: { increment: 1 },
        nextAutomaticReminderAt: item.automaticReminderStep < 2 ? postponeAfterManualReminder(now, item.organisation.timezone) : null,
      },
    }),
    db.activity.create({
      data: { organisationId: ctx.org.id, projectId: item.projectId, type: "reminder.sent", actorType: "user", actorId: ctx.user.id, actorName: ctx.user.name ?? "You", summary: `${ctx.user.name ?? "You"} sent a reminder for ${item.title}` },
    }),
  ]);

  revalidatePath("/waiting");
  revalidatePath("/home");
  return { ok: true, sent: delivery.accepted };
}

export async function setWaitingItemAutopilotStateAction(waitingItemId: string, paused: boolean) {
  const ctx = await getAppContext();
  const item = await db.waitingItem.findFirst({ where: { id: waitingItemId, organisationId: ctx.org.id }, include: { organisation: true } });
  if (!item) return { ok: false as const, error: "Item not found" };
  const next = paused || item.automaticReminderStep >= 2
    ? null
    : item.nextAutomaticReminderAt ?? postponeAfterManualReminder(new Date(), item.organisation.timezone);
  await db.waitingItem.update({ where: { id: item.id }, data: { automaticReminderState: paused ? "paused" : "inherit", nextAutomaticReminderAt: next } });
  revalidatePath("/waiting");
  return { ok: true as const };
}
