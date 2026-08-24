"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { createFileComment, setCommentResolved } from "@/lib/file-comments";

const addSchema = z.object({
  fileId: z.string().min(1),
  body: z.string().min(1).max(2000),
  x: z.number().min(0).max(1).nullable().optional(),
  y: z.number().min(0).max(1).nullable().optional(),
  page: z.number().int().min(1).max(10000).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

/** Verify the portal client is assigned to the file's project. */
async function assertFileAccess(fileId: string, clientId: string) {
  const file = await db.file.findUnique({ where: { id: fileId }, select: { projectId: true } });
  if (!file?.projectId) return null;
  return (await assertClientProject(clientId, file.projectId)) ? file : null;
}

export async function addPortalFileComment(input: z.infer<typeof addSchema>): Promise<void> {
  const client = await getPortalClient();
  if (!client) return;
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return;
  if (!(await assertFileAccess(parsed.data.fileId, client.id))) return;

  await createFileComment({
    fileId: parsed.data.fileId,
    authorType: "client",
    authorId: client.id,
    authorName: client.name,
    body: parsed.data.body,
    x: parsed.data.x ?? null,
    y: parsed.data.y ?? null,
    page: parsed.data.page ?? null,
    parentId: parsed.data.parentId ?? null,
  });
  revalidatePath(`/portal/files/view/${parsed.data.fileId}`);
}

export async function resolvePortalFileComment(commentId: string, resolved: boolean): Promise<void> {
  const client = await getPortalClient();
  if (!client) return;
  const comment = await db.fileComment.findUnique({ where: { id: commentId }, select: { fileId: true } });
  if (!comment) return;
  if (!(await assertFileAccess(comment.fileId, client.id))) return;
  await setCommentResolved(commentId, resolved);
  revalidatePath(`/portal/files/view/${comment.fileId}`);
}
