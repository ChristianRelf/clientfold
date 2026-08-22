"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { createClientInvitation } from "@/lib/auth/invitations";
import { sendReminderEmail } from "@/lib/email";

export type RemindResult = { ok: true; sent: boolean } | { ok: false; error: string };

// Prevent accidental spam: one manual reminder per item per cooldown window.
const COOLDOWN_HOURS = 24;

const ACTION_LABEL: Record<string, string> = {
  approval: "Review it now",
  file_request: "Upload your files",
  payment: "Pay the invoice",
  task: "Complete the request",
  reply: "Reply now",
};

/**
 * Send a manual reminder for a Waiting item. Staff-only and tenant-scoped: the
 * item must belong to the current organisation. Emails the client a fresh portal
 * link, records reminder history, and enforces a cooldown so clients aren't
 * spammed. In dev (no email provider) the reminder is still recorded — the
 * "sent" flag reflects whether an email actually went out.
 */
export async function sendReminderAction(waitingItemId: string): Promise<RemindResult> {
  const ctx = await getAppContext();

  const item = await db.waitingItem.findFirst({
    where: { id: waitingItemId, organisationId: ctx.org.id },
    include: { client: true, project: true, organisation: true },
  });
  if (!item) return { ok: false, error: "Item not found" };
  if (item.status !== "waiting") return { ok: false, error: "This item is already resolved" };

  // Cooldown check.
  if (item.lastRemindedAt) {
    const hoursSince = (Date.now() - item.lastRemindedAt.getTime()) / 3_600_000;
    if (hoursSince < COOLDOWN_HOURS) {
      const wait = Math.ceil(COOLDOWN_HOURS - hoursSince);
      return { ok: false, error: `Already reminded recently. Try again in ${wait}h.` };
    }
  }

  if (!item.client) return { ok: false, error: "No client to remind" };

  // Fresh magic link so the reminder lands the client straight in their portal.
  let sent = false;
  const invite = await createClientInvitation({
    organisationId: ctx.org.id,
    clientId: item.client.id,
    email: item.client.email,
  });
  sent = await sendReminderEmail(item.client.email, invite.url, {
    orgName: item.organisation.name,
    projectName: item.project?.name ?? "your project",
    itemTitle: item.title,
    action: ACTION_LABEL[item.type] ?? "Open your portal",
  });

  // Record history regardless of delivery channel availability.
  await db.$transaction([
    db.reminder.create({ data: { waitingItemId: item.id, channel: "email", automatic: false } }),
    db.waitingItem.update({
      where: { id: item.id },
      data: { lastRemindedAt: new Date(), reminderCount: { increment: 1 } },
    }),
    db.activity.create({
      data: {
        organisationId: ctx.org.id,
        projectId: item.projectId,
        type: "reminder.sent",
        actorType: "user",
        actorId: ctx.user.id,
        actorName: ctx.user.name ?? "You",
        summary: `${ctx.user.name ?? "You"} sent a reminder for ${item.title}`,
      },
    }),
  ]);

  revalidatePath("/waiting");
  revalidatePath("/home");
  return { ok: true, sent };
}
