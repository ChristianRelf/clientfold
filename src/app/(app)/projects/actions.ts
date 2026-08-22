"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { uniqueSlug } from "@/lib/slug";
import { trackEvent } from "@/lib/marketing/events";
import { getVisitorId } from "@/lib/marketing/attribution";

const schema = z.object({
  name: z.string().min(1, "Give the project a name").max(120),
  clientId: z.string().optional(),
  description: z.string().max(2000).optional(),
  targetDate: z.string().optional(),
});

export type ProjectFormState = { error?: string } | undefined;

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const ctx = await getAppContext();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid details" };

  const { name, clientId, description, targetDate } = parsed.data;

  const slug = await uniqueSlug(name, async (s) =>
    Boolean(await db.project.findFirst({ where: { organisationId: ctx.org.id, slug: s } })),
  );

  // clientId, if provided, must belong to this org (tenancy check).
  let safeClientId: string | undefined;
  if (clientId) {
    const client = await db.client.findFirst({
      where: { id: clientId, organisationId: ctx.org.id },
      select: { id: true },
    });
    safeClientId = client?.id;
  }

  const project = await db.project.create({
    data: {
      organisationId: ctx.org.id,
      name,
      slug,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      clients: safeClientId ? { create: { clientId: safeClientId } } : undefined,
      members: { create: { userId: ctx.user.id, role: "owner" } },
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
  await trackEvent("onboarding.project_created", { visitorId, userId: ctx.user.id, organisationId: ctx.org.id });

  redirect(`/projects/${slug}`);
}
