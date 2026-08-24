import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { storage, validateUpload, buildKey } from "@/lib/storage";
import { trackEvent } from "@/lib/marketing/events";
import { notifyMembers } from "@/lib/notifications";

/**
 * Client file upload against a FileRequest. Verifies the portal session AND that
 * the client is assigned to the request's project (no IDOR). Validates each file
 * (size + type), stores it, records File + FileVersion, advances the request and
 * — when complete — resolves the matching Waiting item and logs activity.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const client = await getPortalClient();
  if (!client) return NextResponse.json({ error: "Session expired" }, { status: 401 });

  const form = await request.formData();
  const fileRequestId = form.get("fileRequestId");
  if (typeof fileRequestId !== "string") return NextResponse.json({ error: "Missing request" }, { status: 400 });

  const fileRequest = await db.fileRequest.findUnique({
    where: { id: fileRequestId },
    include: { project: true },
  });
  if (!fileRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const allowed = await assertClientProject(client.id, fileRequest.projectId);
  if (!allowed) return NextResponse.json({ error: "No access" }, { status: 403 });

  const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
  if (uploads.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 });

  const orgId = fileRequest.project.organisationId;
  const created: { id: string; name: string }[] = [];

  for (const upload of uploads) {
    const problem = validateUpload(upload);
    if (problem) return NextResponse.json({ error: problem }, { status: 422 });

    const key = buildKey(orgId, upload.name);
    const bytes = Buffer.from(await upload.arrayBuffer());
    const contentType = upload.type || "application/octet-stream";
    await storage.put(key, bytes, contentType);

    const file = await db.file.create({
      data: {
        organisationId: orgId,
        projectId: fileRequest.projectId,
        name: upload.name,
        mimeType: contentType,
        size: bytes.length,
        storageKey: key,
        relatedType: "file_request",
        relatedId: fileRequest.id,
        uploaderType: "client",
        uploaderId: client.id,
        versions: { create: { version: 1, storageKey: key, size: bytes.length } },
      },
    });
    created.push({ id: file.id, name: file.name });
  }

  // Advance the request: complete when at least as many files as items requested.
  const requestedCount = fileRequest.requestedItems ? (JSON.parse(fileRequest.requestedItems) as string[]).length : 1;
  const totalUploaded = await db.file.count({
    where: { relatedType: "file_request", relatedId: fileRequest.id, archived: false },
  });
  const complete = totalUploaded >= requestedCount;

  await db.fileRequest.update({
    where: { id: fileRequest.id },
    data: { status: complete ? "complete" : "partial", completedAt: complete ? new Date() : null },
  });

  // Activity for the agency feed (filename is safe to show internally).
  await db.activity.create({
    data: {
      organisationId: orgId,
      projectId: fileRequest.projectId,
      type: "file.uploaded",
      actorType: "client",
      actorId: client.id,
      actorName: client.name,
      summary: `${client.name} uploaded ${created.length} file${created.length === 1 ? "" : "s"} to ${fileRequest.title}`,
    },
  });

  if (complete) {
    await db.waitingItem.updateMany({
      where: { projectId: fileRequest.projectId, type: "file_request", title: fileRequest.title, status: "waiting" },
      data: { status: "resolved", resolvedAt: new Date() },
    });
    await db.activity.create({
      data: {
        organisationId: orgId,
        projectId: fileRequest.projectId,
        type: "file_request.completed",
        actorType: "client",
        actorId: client.id,
        actorName: client.name,
        summary: `${fileRequest.title} completed by ${client.name}`,
      },
    });
    await trackEvent("waiting.item_resolved", { organisationId: orgId }, { type: "file_request" });
  }
  await trackEvent("client.action_completed", { organisationId: orgId }, { type: "file_upload" });
  await notifyMembers({ organisationId: orgId, type: "file.uploaded", title: `${client.name} uploaded ${created.length} file${created.length === 1 ? "" : "s"}`, body: fileRequest.title, href: `/projects/${fileRequest.project.slug}` });

  return NextResponse.json({ ok: true, complete, files: created });
}
