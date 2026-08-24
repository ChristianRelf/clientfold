"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { assertRole, requireOrg } from "@/lib/tenancy";
import { assertSafeWebhookUrl, isWebhookEvent, queueWebhookTest, attemptWebhookDelivery } from "@/lib/integrations/webhooks";

const endpointSchema = z.object({
  url: z.string().trim().url().max(2_048),
  description: z.string().trim().max(120).optional(),
});

async function adminContext() {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  return ctx;
}

export async function createWebhookEndpointAction(formData: FormData): Promise<void> {
  const ctx = await adminContext();
  const parsed = endpointSchema.safeParse({ url: formData.get("url"), description: formData.get("description") });
  const events = formData.getAll("events").filter((value): value is string => typeof value === "string" && isWebhookEvent(value));
  if (!parsed.success || !events.length) redirect("/settings/integrations/webhook?error=details");
  try {
    const url = await assertSafeWebhookUrl(parsed.data.url);
    const endpoint = await db.webhookEndpoint.create({
      data: { organisationId: ctx.org.id, url: url.toString(), description: parsed.data.description || null, events: JSON.stringify([...new Set(events)]), createdById: ctx.user.id },
    });
    await Promise.all([
      db.integration.upsert({
        where: { organisationId_provider: { organisationId: ctx.org.id, provider: "webhook" } },
        create: { organisationId: ctx.org.id, provider: "webhook", status: "connected", connectedAt: new Date(), config: JSON.stringify({ endpointCount: 1 }) },
        update: { status: "connected", connectedAt: new Date() },
      }),
      db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "webhook.endpoint_created", targetType: "WebhookEndpoint", targetId: endpoint.id, metadata: JSON.stringify({ events: events.length }) } }),
    ]);
  } catch {
    redirect("/settings/integrations/webhook?error=url");
  }
  revalidatePath("/settings/integrations");
  revalidatePath("/settings/integrations/webhook");
  redirect("/settings/integrations/webhook?created=1");
}

export async function setWebhookEndpointStatusAction(endpointId: string, enabled: boolean): Promise<void> {
  const ctx = await adminContext();
  const endpoint = await db.webhookEndpoint.findFirst({ where: { id: endpointId, organisationId: ctx.org.id }, select: { id: true } });
  if (!endpoint) return;
  await db.webhookEndpoint.update({ where: { id: endpoint.id }, data: { status: enabled ? "active" : "disabled", failureCount: enabled ? 0 : undefined } });
  const activeCount = await db.webhookEndpoint.count({ where: { organisationId: ctx.org.id, status: "active" } });
  await Promise.all([
    db.integration.upsert({
      where: { organisationId_provider: { organisationId: ctx.org.id, provider: "webhook" } },
      create: { organisationId: ctx.org.id, provider: "webhook", status: activeCount ? "connected" : "disconnected", connectedAt: activeCount ? new Date() : null, config: JSON.stringify({ endpointCount: activeCount }) },
      update: { status: activeCount ? "connected" : "disconnected", config: JSON.stringify({ endpointCount: activeCount }) },
    }),
    db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: enabled ? "webhook.endpoint_enabled" : "webhook.endpoint_disabled", targetType: "WebhookEndpoint", targetId: endpoint.id } }),
  ]);
  revalidatePath("/settings/integrations");
  revalidatePath("/settings/integrations/webhook");
}

export async function rotateWebhookSecretAction(endpointId: string): Promise<void> {
  const ctx = await adminContext();
  const endpoint = await db.webhookEndpoint.findFirst({ where: { id: endpointId, organisationId: ctx.org.id }, select: { id: true } });
  if (!endpoint) return;
  await Promise.all([
    db.webhookEndpoint.update({ where: { id: endpoint.id }, data: { secretVersion: { increment: 1 } } }),
    db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "webhook.secret_rotated", targetType: "WebhookEndpoint", targetId: endpoint.id } }),
  ]);
  revalidatePath("/settings/integrations/webhook");
}

export async function sendWebhookTestAction(endpointId: string): Promise<void> {
  const ctx = await adminContext();
  await queueWebhookTest(endpointId, ctx.org.id);
  revalidatePath("/settings/integrations/webhook");
  redirect("/settings/integrations/webhook?tested=1");
}

export async function retryWebhookDeliveryAction(deliveryId: string): Promise<void> {
  const ctx = await adminContext();
  const delivery = await db.webhookDelivery.findFirst({ where: { id: deliveryId, endpoint: { organisationId: ctx.org.id } }, select: { id: true } });
  if (!delivery) return;
  await attemptWebhookDelivery(delivery.id);
  revalidatePath("/settings/integrations/webhook");
}
