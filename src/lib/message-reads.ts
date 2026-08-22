import { db } from "@/lib/db";

/**
 * Message read-state. `Message.readBy` is a JSON array of *viewer keys* — a
 * type-prefixed id so a staff user (`u:<id>`) and a client (`c:<id>`) can never
 * collide even if their cuids happened to match. A message is "unread" for a
 * viewer when their key is absent from `readBy`. Authors are seeded into
 * `readBy` on create, so you never see your own message as unread.
 */

export type ViewerType = "user" | "client";

export function viewerKey(type: ViewerType, id: string): string {
  return `${type === "user" ? "u" : "c"}:${id}`;
}

export function parseReadBy(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Count messages the viewer hasn't read yet. */
export function countUnread(messages: { readBy: string | null }[], viewer: string): number {
  let n = 0;
  for (const m of messages) {
    if (!parseReadBy(m.readBy).includes(viewer)) n++;
  }
  return n;
}

/** Mark every message in a thread as read by `viewer` (idempotent). */
export async function markThreadRead(threadId: string, viewer: string): Promise<void> {
  const msgs = await db.message.findMany({ where: { threadId }, select: { id: true, readBy: true } });
  for (const m of msgs) {
    const arr = parseReadBy(m.readBy);
    if (arr.includes(viewer)) continue;
    arr.push(viewer);
    await db.message.update({ where: { id: m.id }, data: { readBy: JSON.stringify(arr) } });
  }
}

/** Mark all threads on a project as read by `viewer` (the portal has one view). */
export async function markProjectThreadsRead(projectId: string, viewer: string): Promise<void> {
  const threads = await db.messageThread.findMany({ where: { projectId }, select: { id: true } });
  for (const t of threads) await markThreadRead(t.id, viewer);
}

/** Total unread messages for a staff user across their org's threads. */
export async function inboxUnreadForUser(organisationId: string, userId: string): Promise<number> {
  const messages = await db.message.findMany({
    where: { thread: { organisationId } },
    select: { readBy: true },
  });
  return countUnread(messages, viewerKey("user", userId));
}
