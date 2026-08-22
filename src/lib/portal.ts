import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPortalClient, type PortalClient } from "@/lib/auth/portal-session";
import { getPortalProjectView } from "@/lib/queries/portal-project";
import type { PortalProjectView } from "@/lib/portal-view";

/**
 * Portal data access. A client may only ever see projects explicitly assigned to
 * them via ProjectClient — enforced here, server-side. Every portal query is
 * scoped by clientId; a client can never read another client's data or reach the
 * agency app.
 */

export type PortalBranding = {
  organisationName: string;
  portalName: string | null;
  accentColor: string;
  currency: string;
  removeBranding: boolean;
  referralCode: string;
};

export type PortalProjectSummary = {
  id: string;
  name: string;
  slug: string;
  progress: number;
};

export type PortalContext = {
  client: PortalClient;
  branding: PortalBranding;
  projects: PortalProjectSummary[];
};

export async function requirePortalClient(): Promise<PortalClient> {
  const client = await getPortalClient();
  if (!client) redirect("/portal/enter");
  return client;
}

export async function getPortalContext(): Promise<PortalContext> {
  const client = await requirePortalClient();

  const [org, links] = await Promise.all([
    db.organisation.findUnique({ where: { id: client.organisationId } }),
    db.projectClient.findMany({
      where: { clientId: client.id },
      include: { project: true },
    }),
  ]);

  const projects = links
    .map((l) => l.project)
    .filter((p) => p.status !== "archived")
    .map((p) => ({ id: p.id, name: p.name, slug: p.slug, progress: p.progress }));

  return {
    client,
    branding: {
      organisationName: org?.name ?? "",
      portalName: org?.portalName ?? null,
      accentColor: org?.accentColor ?? "231 48% 48%",
      currency: org?.currency ?? "GBP",
      removeBranding: org?.removeBranding ?? false,
      referralCode: org?.referralCode ?? "",
    },
    projects,
  };
}

/** Verify a client can access a given project id (throws 404 via notFound path). */
export async function assertClientProject(clientId: string, projectId: string): Promise<boolean> {
  const link = await db.projectClient.findFirst({
    where: { clientId, projectId },
    select: { id: true },
  });
  return Boolean(link);
}

/**
 * Resolve the client's active project + its portal view for a page. Optionally
 * pins to a specific slug (must be assigned to the client, else 404).
 */
export async function resolveActivePortal(
  slug?: string,
): Promise<{ ctx: PortalContext; project: PortalProjectView }> {
  const ctx = await getPortalContext();
  if (ctx.projects.length === 0) redirect("/portal/enter");

  const chosen = slug ? ctx.projects.find((p) => p.slug === slug) : ctx.projects[0];
  if (!chosen) notFound();

  const view = await getPortalProjectView(chosen.id, ctx.client.id);
  if (!view) notFound();

  return { ctx, project: view };
}

/** Record that the client has opened the portal (activation signal, once). */
export async function markPortalOpened(client: PortalClient, projectId?: string): Promise<void> {
  try {
    await db.client.update({ where: { id: client.id }, data: { lastActiveAt: new Date() } });
  } catch {
    /* noop */
  }
}
