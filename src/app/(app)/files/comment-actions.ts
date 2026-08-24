"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/tenancy";
import { createFileComment, setCommentResolved } from "@/lib/file-comments";

const addSchema = z.object({
  fileId: z.string().min(1),
  body: z.string().min(1).max(2000),
  x: z.number().min(0).max(1).nullable().optional(),
  y: z.number().min(0).max(1).nullable().optional(),
  page: z.number().int().min(1).max(10000).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

/** Verify the staff user belongs to the file's organisation. */
async function assertFileAccess(fileId: string, userId: string) {
  const file = await db.file.findUnique({ where: { id: fileId }, select: { organisationId: true } });
  if (!file) return null;
  const member = await db.organisationMember.findUnique({
    where: { organisationId_userId: { organisationId: file.organisationId, userId } },
    select: { id: true },
  });
  return member ? file : null;
}

export async function addAgencyFileComment(input: z.infer<typeof addSchema>): Promise<void> {
  const user = await requireUser();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return;
  if (!(await assertFileAccess(parsed.data.fileId, user.id))) return;

  await createFileComment({
    fileId: parsed.data.fileId,
    authorType: "user",
    authorId: user.id,
    authorName: user.name ?? "Team",
    body: parsed.data.body,
    x: parsed.data.x ?? null,
    y: parsed.data.y ?? null,
    page: parsed.data.page ?? null,
    parentId: parsed.data.parentId ?? null,
  });
  revalidatePath(`/files/${parsed.data.fileId}`);
}

export async function resolveAgencyFileComment(commentId: string, resolved: boolean): Promise<void> {
  const user = await requireUser();
  const comment = await db.fileComment.findUnique({ where: { id: commentId }, select: { fileId: true } });
  if (!comment) return;
  if (!(await assertFileAccess(comment.fileId, user.id))) return;
  await setCommentResolved(commentId, resolved);
  revalidatePath(`/files/${comment.fileId}`);
}
