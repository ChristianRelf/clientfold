"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { viewerKey } from "@/lib/message-reads";
import { trackEvent } from "@/lib/marketing/events";
import { sendClientMessageNotification } from "@/lib/email";
import { notifyMembers } from "@/lib/notifications";
import { saveMessageAttachments } from "@/lib/message-attachments";

const schema = z.object({ body: z.string().max(4000).optional() });

/**
 * Client sends a message from the portal. Scoped to the client's assigned
 * project; a thread is created lazily on first message. Also nudges the agency
 * activity feed so a reply doesn't get lost.
 */
export async function sendPortalMessageAction(formData: FormData): Promise<void> {
  const client = await getPortalClient();
  if (!client) return;

  const parsed = schema.safeParse({ body: formData.get("body") || undefined });
  if (!parsed.success) return;
  const uploads = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (!parsed.data.body?.trim() && !uploads.length) return;

  // Resolve the client's first assigned project.
  const link = await db.projectClient.findFirst({
    where: { clientId: client.id },
    include: { project: true },
    orderBy: { id: "asc" },
  });
  if (!link) return;
  const project = link.project;

  const allowed = await assertClientProject(client.id, project.id);
  if (!allowed) return;

  let thread = await db.messageThread.findFirst({
    where: { organisationId: project.organisationId, projectId: project.id },
    orderBy: { createdAt: "asc" },
  });
  if (!thread) {
    thread = await db.messageThread.create({
      data: { organisationId: project.organisationId, projectId: project.id, subject: project.name },
    });
  }

  const body = parsed.data.body?.trim() || `Shared ${uploads.length} attachment${uploads.length === 1 ? "" : "s"}`;
  let attachmentIds: string[] = [];
  try {
    attachmentIds = await saveMessageAttachments({ files: uploads, organisationId: project.organisationId, projectId: project.id, threadId: thread.id, uploaderType: "client", uploaderId: client.id });
  } catch {
    return;
  }

  await db.message.create({
    data: {
      threadId: thread.id,
      body,
      authorType: "client",
      authorId: client.id,
      authorName: client.name,
      readBy: JSON.stringify([viewerKey("client", client.id)]),
      attachments: attachmentIds.length ? JSON.stringify(attachmentIds) : null,
    },
  });
  await db.messageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  await db.activity.create({
    data: {
      organisationId: project.organisationId,
      projectId: project.id,
      type: "message.created",
      actorType: "client",
      actorId: client.id,
      actorName: client.name,
      summary: `${client.name} sent a message`,
    },
  });
  await trackEvent("client.action_completed", { organisationId: project.organisationId }, { type: "message" });

  await notifyMembers({ organisationId: project.organisationId, type: "message.received", title: `New message from ${client.name}`, body, href: `/inbox/${thread.id}` });

  // Notify agency staff by email (best-effort, never throws).
  void notifyAgencyOfClientMessage({
    organisationId: project.organisationId,
    projectName: project.name,
    clientName: client.name,
    threadId: thread.id,
    preview: body.slice(0, 200),
  });

  revalidatePath("/portal/messages");
}

async function notifyAgencyOfClientMessage(params: {
  organisationId: string;
  projectName: string;
  clientName: string;
  threadId: string;
  preview: string;
}) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const inboxUrl = `${appUrl}/inbox/${params.threadId}`;

  const members = await db.organisationMember.findMany({
    where: { organisationId: params.organisationId, role: { in: ["owner", "admin"] } },
    include: { user: { select: { email: true } } },
  });

  await Promise.allSettled(
    members.map((m) =>
      sendClientMessageNotification(m.user.email, {
        orgName: "",
        projectName: params.projectName,
        clientName: params.clientName,
        preview: params.preview,
        inboxUrl,
      }),
    ),
  );
}
