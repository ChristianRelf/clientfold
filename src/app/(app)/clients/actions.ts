"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { createClientInvitation } from "@/lib/auth/invitations";
import { sendClientInvite } from "@/lib/email";
import { trackEvent } from "@/lib/marketing/events";
import { getVisitorId } from "@/lib/marketing/attribution";

const schema = z.object({
  name: z.string().min(1, "Enter the client's name").max(120),
  email: z.string().email("Enter a valid email"),
  company: z.string().max(120).optional(),
  projectId: z.string().optional(),
  sendInvite: z.string().optional(), // "on" when checked
});

export type ClientFormState =
  | { ok: true; clientName: string; sent: boolean; inviteUrl?: string }
  | { ok?: false; error: string }
  | undefined;

/**
 * Create a client in the current organisation and (optionally) send a portal
 * invitation. Tenant-scoped: the client and any project link belong to the
 * caller's org. Returns the magic link in dev when no email provider is set so
 * the flow is testable end-to-end.
 */
export async function createClientAction(_prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const ctx = await getAppContext();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { name, email, company, projectId } = parsed.data;
  const sendInvite = parsed.data.sendInvite === "on";

  // Unique per org (matches the DB constraint) — give a friendly message.
  const existing = await db.client.findFirst({
    where: { organisationId: ctx.org.id, email },
    select: { id: true },
  });
  if (existing) return { error: "A client with that email already exists" };

  // A supplied projectId must belong to this org (tenancy).
  let safeProjectId: string | undefined;
  if (projectId) {
    const project = await db.project.findFirst({
      where: { id: projectId, organisationId: ctx.org.id },
      select: { id: true, name: true },
    });
    safeProjectId = project?.id;
  }

  const client = await db.client.create({
    data: {
      organisationId: ctx.org.id,
      name,
      email,
      company: company || null,
      status: "active",
      projectLinks: safeProjectId ? { create: { projectId: safeProjectId } } : undefined,
    },
  });

  await db.activity.create({
    data: {
      organisationId: ctx.org.id,
      projectId: safeProjectId,
      type: "client.invited",
      actorType: "user",
      actorId: ctx.user.id,
      actorName: ctx.user.name ?? "You",
      summary: `${ctx.user.name ?? "You"} added ${company || name}`,
    },
  });

  const visitorId = (await getVisitorId()) ?? undefined;
  await trackEvent("client.invited", { visitorId, userId: ctx.user.id, organisationId: ctx.org.id }, {});

  revalidatePath("/clients");

  if (!sendInvite) {
    return { ok: true, clientName: company || name, sent: false };
  }

  // Send the portal magic link.
  const projectName = safeProjectId
    ? (await db.project.findUnique({ where: { id: safeProjectId }, select: { name: true } }))?.name ?? "your project"
    : "your project";
  const invite = await createClientInvitation({ organisationId: ctx.org.id, clientId: client.id, email });
  const sent = (await sendClientInvite(email, invite.url, ctx.org.name, projectName)).accepted;

  return {
    ok: true,
    clientName: company || name,
    sent,
    inviteUrl: !sent && process.env.NODE_ENV !== "production" ? invite.url : undefined,
  };
}
