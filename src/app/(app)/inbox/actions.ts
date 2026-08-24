"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { viewerKey } from "@/lib/message-reads";
import { sendAgencyReplyNotification } from "@/lib/email";
import { saveMessageAttachments } from "@/lib/message-attachments";
import { notifyMembers } from "@/lib/notifications";

const schema = z.object({ body: z.string().max(4000).optional() });

/**
 * Staff replies to a thread. Tenant-scoped: the thread must belong to the
 * caller's organisation (threadId is bound server-side by the page, but we
 * re-verify ownership here — never trust the client).
 */
export async function sendAgencyMessageAction(threadId: string, formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  const parsed = schema.safeParse({ body: formData.get("body") || undefined });
  if (!parsed.success) return;
  const uploads = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (!parsed.data.body?.trim() && !uploads.length) return;

  const thread = await db.messageThread.findFirst({
    where: { id: threadId, organisationId: ctx.org.id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          clients: { include: { client: { select: { email: true, name: true } } } },
          marketplaceLinks: { where: { engagementMode: "marketplace_only" }, select: { id: true }, take: 1 },
        },
      },
    },
  });
  if (!thread) return;

  // Marketplace-origin work keeps buyer communication on the marketplace.
  if (thread.project?.marketplaceLinks.length) return;

  const body = parsed.data.body?.trim() || `Shared ${uploads.length} attachment${uploads.length === 1 ? "" : "s"}`;
  let attachmentIds: string[] = [];
  try {
    attachmentIds = await saveMessageAttachments({ files: uploads, organisationId: ctx.org.id, projectId: thread.project?.id, threadId: thread.id, uploaderType: "user", uploaderId: ctx.user.id });
  } catch {
    return;
  }

  await db.message.create({
    data: {
      threadId: thread.id,
      body,
      authorType: "user",
      authorId: ctx.user.id,
      authorName: ctx.user.name ?? "Team",
      readBy: JSON.stringify([viewerKey("user", ctx.user.id)]),
      attachments: attachmentIds.length ? JSON.stringify(attachmentIds) : null,
    },
  });

  const members = await db.organisationMember.findMany({ where: { organisationId: ctx.org.id, userId: { not: ctx.user.id } }, include: { user: { select: { id: true, name: true, email: true } } } });
  const lowerBody = body.toLowerCase();
  const mentionedIds = members.filter(({ user }) => {
    const labels = [user.name, user.email.split("@")[0]].filter(Boolean) as string[];
    return labels.some((label) => lowerBody.includes(`@${label.toLowerCase()}`));
  }).map(({ userId }) => userId);
  if (mentionedIds.length) await notifyMembers({ organisationId: ctx.org.id, userIds: mentionedIds, type: "message.mentioned", title: `${ctx.user.name ?? "A teammate"} mentioned you`, body, href: `/inbox/${thread.id}` });
  await db.messageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  await db.activity.create({
    data: {
      organisationId: ctx.org.id,
      projectId: thread.project?.id ?? null,
      type: "message.created",
      actorType: "user",
      actorId: ctx.user.id,
      actorName: ctx.user.name ?? "Team",
      summary: `${ctx.user.name ?? "You"} replied`,
    },
  });

  // Notify the project's client contacts (best-effort, never throws).
  if (thread.project) {
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const portalUrl = `${appUrl}/portal/messages`;
    await Promise.allSettled(
      thread.project.clients.flatMap((pc) => pc.client.email ? [
        sendAgencyReplyNotification(pc.client.email, {
          orgName: ctx.org.name,
          projectName: thread.project!.name,
          preview: body.slice(0, 200),
          portalUrl,
        }),
      ] : []),
    );
  }

  revalidatePath(`/inbox/${threadId}`);
  revalidatePath("/inbox");
}
