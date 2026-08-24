"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";

export async function markNotificationReadAction(id: string): Promise<void> {
  const ctx = await getAppContext();
  await db.notification.updateMany({
    where: { id, organisationId: ctx.org.id, userId: ctx.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const ctx = await getAppContext();
  await db.notification.updateMany({
    where: { organisationId: ctx.org.id, userId: ctx.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}
