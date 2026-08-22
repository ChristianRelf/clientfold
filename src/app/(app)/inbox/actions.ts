"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { viewerKey } from "@/lib/message-reads";
import { sendAgencyReplyNotification } from "@/lib/email";

const schema = z.object({ body: z.string().min(1).max(4000) });

/**
 * Staff replies to a thread. Tenant-scoped: the thread must belong to the
 * caller's organisation (threadId is bound server-side by the page, but we
 * re-verify ownership here — never trust the client).
 */
export async function sendAgencyMessageAction(threadId: string, formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  const parsed = schema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return;

  const thread = await db.messageThread.findFirst({
    where: { id: threadId, organisationId: ctx.org.id },
    include: {
      project: { select: { id: true, name: true, clients: { include: { client: { select: { email: true, name: true } } } } } },
    },
  });
  if (!thread) return;

  const body = parsed.data.body.trim();

  await db.message.create({
    data: {
      threadId: thread.id,
      body,
      authorType: "user",
      authorId: ctx.user.id,
      authorName: ctx.user.name ?? "Team",
      readBy: JSON.stringify([viewerKey("user", ctx.user.id)]),
    },
  });
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
      thread.project.clients.map((pc) =>
        sendAgencyReplyNotification(pc.client.email, {
          orgName: ctx.org.name,
          projectName: thread.project!.name,
          preview: body.slice(0, 200),
          portalUrl,
        }),
      ),
    );
  }

  revalidatePath(`/inbox/${threadId}`);
  revalidatePath("/inbox");
}
