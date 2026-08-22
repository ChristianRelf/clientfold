import { db } from "@/lib/db";

/** Shared file-comment logic used by both the portal and agency actions. */

export type FileCommentView = {
  id: string;
  parentId: string | null;
  authorType: string;
  authorName: string;
  body: string;
  x: number | null;
  y: number | null;
  resolved: boolean;
  createdAt: string;
};

export type NewComment = {
  fileId: string;
  authorType: "user" | "client";
  authorId?: string;
  authorName: string;
  body: string;
  x?: number | null;
  y?: number | null;
  parentId?: string | null;
};

export async function listFileComments(fileId: string): Promise<FileCommentView[]> {
  const rows = await db.fileComment.findMany({ where: { fileId }, orderBy: { createdAt: "asc" } });
  return rows.map((c) => ({
    id: c.id,
    parentId: c.parentId,
    authorType: c.authorType,
    authorName: c.authorName,
    body: c.body,
    x: c.x,
    y: c.y,
    resolved: c.resolved,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createFileComment(input: NewComment): Promise<void> {
  // Pins only allowed on top-level comments; replies inherit their parent.
  const isReply = Boolean(input.parentId);
  await db.fileComment.create({
    data: {
      fileId: input.fileId,
      parentId: input.parentId ?? null,
      authorType: input.authorType,
      authorId: input.authorId,
      authorName: input.authorName,
      body: input.body.trim(),
      x: isReply ? null : input.x ?? null,
      y: isReply ? null : input.y ?? null,
    },
  });
}

/** Resolve/reopen a top-level comment (and mark the thread state via the root). */
export async function setCommentResolved(commentId: string, resolved: boolean): Promise<void> {
  await db.fileComment.update({ where: { id: commentId }, data: { resolved } });
}
