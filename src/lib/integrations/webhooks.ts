import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { db } from "@/lib/db";

export const WEBHOOK_EVENTS = [
  "onboarding.project_created",
  "client.invited",
  "client.action_completed",
  "approval.sent",
  "approval.approved",
  "invoice.sent",
  "invoice.paid",
  "waiting.item_created",
  "waiting.item_resolved",
  "reminder.automatic_sent",
  "reminder.automatic_failed",
  "subscription.started",
  "subscription.upgraded",
  "subscription.cancelled",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

const WEBHOOK_EVENT_SET = new Set<string>(WEBHOOK_EVENTS);
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000, 8 * 60 * 60_000];

export function isWebhookEvent(value: string): value is WebhookEventType {
  return WEBHOOK_EVENT_SET.has(value);
}

export function parseWebhookEvents(value: string): WebhookEventType[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is WebhookEventType => typeof item === "string" && isWebhookEvent(item)) : [];
  } catch {
    return [];
  }
}

export function deriveWebhookSecret(endpointId: string, version: number): string {
  const root = process.env.AUTH_SECRET;
  if (!root) throw new Error("AUTH_SECRET is required for webhook signing.");
  return `whsec_${createHmac("sha256", root).update(`clientfold-webhook:${endpointId}:${version}`).digest("base64url")}`;
}

export function signWebhookPayload(secret: string, timestamp: number, payload: string): string {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex")}`;
}

export function verifyWebhookSignature(secret: string, timestamp: number, payload: string, supplied: string): boolean {
  const expected = signWebhookPayload(secret, timestamp, payload);
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}

export function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (isIP(normalized) === 6) {
    if (normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
    const embedded = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return embedded ? isPrivateAddress(embedded) : false;
  }
  if (isIP(normalized) !== 4) return true;
  const [a, b] = normalized.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || b === 51))
    || (a === 203 && b === 0);
}

export function validateWebhookUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid HTTPS endpoint URL."); }
  if (url.protocol !== "https:") throw new Error("Webhook endpoints must use HTTPS.");
  if (url.username || url.password) throw new Error("Webhook endpoint URLs cannot contain credentials.");
  if (url.port && url.port !== "443") throw new Error("Webhook endpoints must use the standard HTTPS port.");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) throw new Error("Private network endpoints are not allowed.");
  if (isIP(hostname) && isPrivateAddress(hostname)) throw new Error("Private network endpoints are not allowed.");
  return url;
}

export async function assertSafeWebhookUrl(value: string): Promise<URL> {
  const url = validateWebhookUrl(value);
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Webhook endpoint must resolve to a public address.");
  return url;
}

type WebhookEventInput = {
  eventId: string;
  type: string;
  organisationId?: string;
  occurredAt: Date;
  data?: Record<string, unknown>;
};

function eventPayload(input: WebhookEventInput): string {
  return JSON.stringify({
    id: input.eventId,
    type: input.type,
    apiVersion: "2026-08-24",
    createdAt: input.occurredAt.toISOString(),
    data: input.data ?? {},
  });
}

/** Create one idempotent delivery per subscribed endpoint, then attempt it immediately. */
export async function dispatchWebhookEvent(input: WebhookEventInput): Promise<void> {
  if (!input.organisationId || !isWebhookEvent(input.type)) return;
  try {
    const endpoints = await db.webhookEndpoint.findMany({ where: { organisationId: input.organisationId, status: "active" } });
    const subscribed = endpoints.filter((endpoint) => parseWebhookEvents(endpoint.events).includes(input.type as WebhookEventType));
    const deliveries = await Promise.all(subscribed.map((endpoint) => db.webhookDelivery.upsert({
      where: { endpointId_eventId: { endpointId: endpoint.id, eventId: input.eventId } },
      create: { endpointId: endpoint.id, eventId: input.eventId, eventType: input.type, payload: eventPayload(input) },
      update: {},
      select: { id: true, status: true },
    })));
    await Promise.allSettled(deliveries.filter((delivery) => delivery.status === "pending").map((delivery) => attemptWebhookDelivery(delivery.id)));
  } catch {
    // Webhook delivery is best-effort and must never interrupt product actions.
  }
}

export async function queueWebhookTest(endpointId: string, organisationId: string): Promise<string | null> {
  const endpoint = await db.webhookEndpoint.findFirst({ where: { id: endpointId, organisationId }, select: { id: true } });
  if (!endpoint) return null;
  const eventId = `test_${randomUUID()}`;
  const delivery = await db.webhookDelivery.create({
    data: { endpointId, eventId, eventType: "webhook.test", payload: eventPayload({ eventId, type: "webhook.test", organisationId, occurredAt: new Date(), data: { message: "ClientFold webhook test" } }) },
    select: { id: true },
  });
  await attemptWebhookDelivery(delivery.id);
  return delivery.id;
}

export async function attemptWebhookDelivery(deliveryId: string): Promise<boolean> {
  const claimed = await db.webhookDelivery.updateMany({
    where: { id: deliveryId, status: { in: ["pending", "failed"] } },
    data: { status: "processing", lastAttemptAt: new Date(), nextAttemptAt: null },
  });
  if (claimed.count !== 1) return false;

  const delivery = await db.webhookDelivery.findUnique({ where: { id: deliveryId }, include: { endpoint: true } });
  if (!delivery || delivery.endpoint.status !== "active") {
    await db.webhookDelivery.update({ where: { id: deliveryId }, data: { status: "failed", responseSnippet: "Endpoint is disabled." } }).catch(() => {});
    return false;
  }

  const attemptCount = delivery.attemptCount + 1;
  try {
    const url = await assertSafeWebhookUrl(delivery.endpoint.url);
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = deriveWebhookSecret(delivery.endpoint.id, delivery.endpoint.secretVersion);
    const response = await fetch(url, {
      method: "POST",
      redirect: "manual",
      headers: {
        "content-type": "application/json",
        "user-agent": "ClientFold-Webhooks/1.0",
        "x-clientfold-id": delivery.eventId,
        "x-clientfold-event": delivery.eventType,
        "x-clientfold-timestamp": String(timestamp),
        "x-clientfold-signature": signWebhookPayload(secret, timestamp, delivery.payload),
      },
      body: delivery.payload,
      signal: AbortSignal.timeout(10_000),
    });
    const responseSnippet = (await response.text()).slice(0, 500) || null;
    if (!response.ok) throw new DeliveryError(`Endpoint returned HTTP ${response.status}.`, response.status, responseSnippet);
    const now = new Date();
    await db.$transaction([
      db.webhookDelivery.update({ where: { id: delivery.id }, data: { status: "delivered", attemptCount, responseStatus: response.status, responseSnippet, deliveredAt: now, nextAttemptAt: null } }),
      db.webhookEndpoint.update({ where: { id: delivery.endpoint.id }, data: { failureCount: 0, lastDeliveredAt: now } }),
    ]);
    return true;
  } catch (error) {
    const retryDelay = RETRY_DELAYS_MS[attemptCount - 1];
    const status = error instanceof DeliveryError ? error.status : null;
    const snippet = error instanceof DeliveryError ? error.snippet : error instanceof Error ? error.message : "Delivery failed.";
    await db.$transaction([
      db.webhookDelivery.update({ where: { id: delivery.id }, data: { status: "failed", attemptCount, responseStatus: status, responseSnippet: (snippet ?? "Delivery failed.").slice(0, 500), nextAttemptAt: retryDelay ? new Date(Date.now() + retryDelay) : null } }),
      db.webhookEndpoint.update({ where: { id: delivery.endpoint.id }, data: { failureCount: { increment: 1 } } }),
    ]).catch(() => {});
    return false;
  }
}

export async function runWebhookRetryJob(limit = 50): Promise<{ scanned: number; delivered: number; failed: number }> {
  const deliveries = await db.webhookDelivery.findMany({
    where: { status: "failed", nextAttemptAt: { lte: new Date() }, endpoint: { status: "active" } },
    orderBy: { nextAttemptAt: "asc" },
    take: Math.max(1, Math.min(limit, 200)),
    select: { id: true },
  });
  const results = await Promise.all(deliveries.map(({ id }) => attemptWebhookDelivery(id)));
  return { scanned: deliveries.length, delivered: results.filter(Boolean).length, failed: results.filter((result) => !result).length };
}

class DeliveryError extends Error {
  constructor(message: string, readonly status: number, readonly snippet: string | null) { super(message); }
}
