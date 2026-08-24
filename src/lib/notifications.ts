import { db } from "@/lib/db";

export type NotificationView = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotifyInput = {
  organisationId: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  roles?: string[];
  userIds?: string[];
  excludeUserIds?: string[];
};

/** Create an in-app notification for selected workspace members. */
export async function notifyMembers(input: NotifyInput): Promise<void> {
  try {
    const members = await db.organisationMember.findMany({
      where: {
        organisationId: input.organisationId,
        ...(input.roles?.length ? { role: { in: input.roles } } : {}),
        ...(input.userIds?.length ? { userId: { in: input.userIds } } : {}),
        ...(input.excludeUserIds?.length ? { NOT: { userId: { in: input.excludeUserIds } } } : {}),
      },
      select: { userId: true },
    });
    if (!members.length) return;
    await db.notification.createMany({
      data: members.map(({ userId }) => ({
        organisationId: input.organisationId,
        userId,
        type: input.type,
        title: input.title,
        body: input.body?.slice(0, 240) ?? null,
        href: input.href ?? null,
      })),
    });
  } catch {
    // Notifications are best-effort and must not break the originating action.
  }
}

export async function listNotifications(organisationId: string, userId: string, take = 20): Promise<NotificationView[]> {
  const rows = await db.notification.findMany({
    where: { organisationId, userId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}
