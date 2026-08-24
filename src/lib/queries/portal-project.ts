import { db } from "@/lib/db";
import type { PortalProjectView } from "@/lib/portal-view";
import { countUnread, viewerKey } from "@/lib/message-reads";
import { parseAttachmentIds } from "@/lib/message-attachments";

/**
 * Build the portal view of a project. Caller must have already verified the
 * client's access to `projectId` (see assertClientProject). Only client-facing
 * records are exposed — internal tasks and notes are never included.
 */
export async function getPortalProjectView(projectId: string, clientId: string): Promise<PortalProjectView | null> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: { orderBy: { order: "asc" } },
      approvals: {
        where: { status: { not: "draft" } },
        include: { versions: { orderBy: { version: "desc" } } },
        orderBy: { updatedAt: "desc" },
      },
      fileRequests: { orderBy: { createdAt: "desc" } },
      threads: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!project) return null;

  // Invoices are scoped to this project AND this client.
  const invoices = await db.invoice.findMany({
    where: { projectId, clientId, status: { not: "draft" } },
    orderBy: { createdAt: "desc" },
  });

  // Files uploaded against this project's file requests, grouped by request.
  const requestIds = project.fileRequests.map((fr) => fr.id);
  const uploadedFiles = requestIds.length
    ? await db.file.findMany({
        where: { relatedType: "file_request", relatedId: { in: requestIds }, archived: false },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, size: true, relatedId: true },
      })
    : [];
  const uploadsByRequest = new Map<string, { id: string; name: string; size: number }[]>();
  for (const f of uploadedFiles) {
    const list = uploadsByRequest.get(f.relatedId!) ?? [];
    list.push({ id: f.id, name: f.name, size: f.size });
    uploadsByRequest.set(f.relatedId!, list);
  }

  // Files the team has shared with the client (not client-uploaded request files).
  const sharedFiles = await db.file.findMany({
    where: {
      projectId,
      archived: false,
      uploaderType: "user",
      OR: [{ relatedType: null }, { relatedType: { notIn: ["file_request", "message"] } }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, mimeType: true },
  });

  const attachmentIds = project.threads.flatMap((thread) => thread.messages.flatMap((message) => parseAttachmentIds(message.attachments)));
  const attachmentFiles = attachmentIds.length ? await db.file.findMany({ where: { id: { in: attachmentIds }, organisationId: project.organisationId }, select: { id: true, name: true, mimeType: true, size: true } }) : [];
  const attachmentsById = new Map(attachmentFiles.map((file) => [file.id, file]));

  const nextMilestone = project.milestones.find((m) => m.status !== "complete");
  const blockingApproval = project.approvals.find((a) => a.status === "awaiting_approval");

  const iso = (d: Date | null) => (d ? d.toISOString() : null);

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    progress: project.progress,
    nextNote: blockingApproval
      ? `${nextMilestone?.title ?? "The next stage"} begins once ${blockingApproval.title} is approved.`
      : nextMilestone
        ? `Next up: ${nextMilestone.title}.`
        : null,
    milestones: project.milestones.map((m) => ({ id: m.id, title: m.title, status: m.status })),
    approvals: project.approvals.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      status: a.status,
      requestedAt: iso(a.requestedAt),
      deadline: iso(a.deadline),
      versions: a.versions.map((v) => ({
        id: v.id,
        version: v.version,
        status: v.status,
        notes: v.notes,
        createdAt: v.createdAt.toISOString(),
      })),
    })),
    fileRequests: project.fileRequests.map((fr) => ({
      id: fr.id,
      title: fr.title,
      instructions: fr.instructions,
      items: fr.requestedItems ? (JSON.parse(fr.requestedItems) as string[]) : [],
      status: fr.status,
      uploaded: uploadsByRequest.get(fr.id) ?? [],
    })),
    sharedFiles: sharedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      isImage: f.mimeType.startsWith("image/"),
    })),
    invoices: invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      total: inv.total,
      amountPaid: inv.amountPaid,
      currency: inv.currency,
      dueDate: iso(inv.dueDate),
    })),
    messages: project.threads.flatMap((t) =>
      t.messages.map((m) => ({
        id: m.id,
        body: m.body,
        authorName: m.authorName,
        authorType: m.authorType,
        createdAt: m.createdAt.toISOString(),
        attachments: parseAttachmentIds(m.attachments).flatMap((id) => { const file = attachmentsById.get(id); return file ? [file] : []; }),
      })),
    ),
    messagesUnread: countUnread(
      project.threads.flatMap((t) => t.messages),
      viewerKey("client", clientId),
    ),
  };
}
