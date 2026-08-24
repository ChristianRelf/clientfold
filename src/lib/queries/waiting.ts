import { db } from "@/lib/db";
import { daysWaiting } from "@/lib/format";
import type { DemoWaitingItem, WaitingType } from "@/lib/demo/data";

/**
 * Load the Waiting Room for an organisation and map DB rows to the shared
 * WaitingItem view shape used across app, demo and marketing. Tenant-scoped by
 * organisationId - callers must pass an org id resolved from a verified session.
 */
export async function getWaitingRoom(organisationId: string): Promise<DemoWaitingItem[]> {
  const items = await db.waitingItem.findMany({
    where: { organisationId, status: "waiting" },
    include: { client: true, project: true, organisation: true },
    orderBy: { requestedAt: "asc" },
  });

  return items.map((i) => ({
    id: i.id,
    client: i.client?.name ?? "Client",
    clientCompany: i.client?.company ?? i.client?.name ?? "Client",
    project: i.project?.name ?? "",
    projectSlug: i.project?.slug ?? "",
    type: i.type as WaitingType,
    title: i.title,
    detail: detailFor(i.type as WaitingType, i.requestedAt),
    daysWaiting: daysWaiting(i.requestedAt),
    amount: i.amount ?? undefined,
    currency: i.currency ?? undefined,
    lastRemindedDays: i.lastRemindedAt ? daysWaiting(i.lastRemindedAt) : undefined,
    automaticReminderState: i.automaticReminderState as "inherit" | "paused",
    automaticReminderStep: i.automaticReminderStep,
    nextAutomaticReminderAt: i.nextAutomaticReminderAt?.toISOString(),
    autopilotEnabled: i.organisation.automaticRemindersEnabled,
    timezone: i.organisation.timezone,
    href: hrefFor(i.type as WaitingType, i.project?.slug, i.sourceId),
  }));
}

function detailFor(type: WaitingType, since: Date): string {
  switch (type) {
    case "approval":
      return "Approval requested";
    case "file_request":
      return "Files requested";
    case "payment":
      return "Payment outstanding";
    case "task":
      return "Requested from client";
    case "reply":
      return "Awaiting reply";
    default:
      return "";
  }
}

function hrefFor(type: WaitingType, projectSlug?: string, sourceId?: string): string {
  // Invoices currently resolve through the tenant-scoped invoice list. Linking
  // to a non-existent detail route strands the most urgent dashboard action.
  if (type === "payment") return "/invoices";
  return projectSlug ? `/projects/${projectSlug}` : "/waiting";
}
