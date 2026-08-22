"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { uniqueSlug } from "@/lib/slug";
import { createClientInvitation } from "@/lib/auth/invitations";
import { sendClientInvite } from "@/lib/email";
import { trackEvent } from "@/lib/marketing/events";
import { getVisitorId } from "@/lib/marketing/attribution";

const payloadSchema = z.object({
  name: z.string().min(1, "Give the project a name").max(120),
  description: z.string().max(2000).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  existingClientId: z.string().optional(),
  milestones: z
    .array(z.object({ title: z.string().min(1).max(120), dueDate: z.string().optional() }))
    .max(20)
    .default([]),
  newClient: z
    .object({ name: z.string().min(1).max(120), email: z.string().email(), company: z.string().max(120).optional() })
    .optional(),
  sendInvite: z.boolean().default(false),
});

export type WizardResult = { ok?: false; error: string } | undefined;

/**
 * Create a project from the multi-step wizard in one atomic action: project +
 * milestones + client link + optional invitation. Everything is tenant-scoped;
 * a supplied client id is verified to belong to the org, a new client is created
 * inside it. Optional steps may be empty.
 */
export async function createProjectWizardAction(input: unknown): Promise<WizardResult> {
  const ctx = await getAppContext();
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  const data = parsed.data;

  // Resolve the client: existing (verified in-org) or a new one to create.
  let clientId: string | undefined;
  if (data.existingClientId) {
    const client = await db.client.findFirst({
      where: { id: data.existingClientId, organisationId: ctx.org.id },
      select: { id: true },
    });
    clientId = client?.id;
  } else if (data.newClient) {
    const dupe = await db.client.findFirst({
      where: { organisationId: ctx.org.id, email: data.newClient.email },
      select: { id: true },
    });
    if (dupe) return { error: "A client with that email already exists" };
    const created = await db.client.create({
      data: {
        organisationId: ctx.org.id,
        name: data.newClient.name,
        email: data.newClient.email,
        company: data.newClient.company || null,
        status: "active",
      },
    });
    clientId = created.id;
  }

  const slug = await uniqueSlug(data.name, async (s) =>
    Boolean(await db.project.findFirst({ where: { organisationId: ctx.org.id, slug: s } })),
  );

  const project = await db.project.create({
    data: {
      organisationId: ctx.org.id,
      name: data.name,
      slug,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      members: { create: { userId: ctx.user.id, role: "owner" } },
      clients: clientId ? { create: { clientId } } : undefined,
      milestones: {
        create: data.milestones.map((m, i) => ({
          title: m.title,
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          order: i + 1,
          status: "upcoming",
        })),
      },
    },
  });

  await db.activity.create({
    data: {
      organisationId: ctx.org.id,
      projectId: project.id,
      type: "project.created",
      actorType: "user",
      actorId: ctx.user.id,
      actorName: ctx.user.name ?? "You",
      summary: `${ctx.user.name ?? "You"} created ${project.name}`,
    },
  });

  const visitorId = (await getVisitorId()) ?? undefined;
  await trackEvent("onboarding.project_created", { visitorId, userId: ctx.user.id, organisationId: ctx.org.id }, {
    count: data.milestones.length,
  });

  // Optionally invite the client to their portal.
  if (data.sendInvite && clientId) {
    const client = await db.client.findUnique({ where: { id: clientId }, select: { email: true } });
    if (client) {
      const invite = await createClientInvitation({ organisationId: ctx.org.id, clientId, email: client.email });
      await sendClientInvite(client.email, invite.url, ctx.org.name, project.name);
      await trackEvent("client.invited", { visitorId, userId: ctx.user.id, organisationId: ctx.org.id }, {});
    }
  }

  redirect(`/projects/${slug}`);
}
