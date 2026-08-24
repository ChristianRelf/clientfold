import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashInboundToken, inboundTokenFromRecipients, verifySignedWebhook } from "@/lib/integrations/inbound";
import { normalizedMarketplaceItemSchema, safeMarketplaceUrl, type MarketplaceProvider } from "@/lib/integrations/marketplace";
import { itemFingerprint } from "@/lib/integrations/marketplace-server";

export const runtime = "nodejs";

type ReceivedEvent = {
  type: string;
  created_at?: string;
  data?: { created_at?: string; email_id?: string; message_id?: string; from?: string; to?: string[]; subject?: string };
};

function verifySvix(payload: string, request: NextRequest): boolean {
  return verifySignedWebhook({
    payload,
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signatures: request.headers.get("svix-signature"),
    secret: process.env.RESEND_WEBHOOK_SECRET,
  });
}

async function retrieveEmail(emailId: string): Promise<{ text?: string; html?: string; headers?: Record<string, string> }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return {};
  const response = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`resend_retrieve_${response.status}`);
  const payload = await response.json() as { data?: { text?: string; html?: string; headers?: Record<string, string> }; text?: string; html?: string; headers?: Record<string, string> };
  return payload.data ?? payload;
}

function plainText(value: string): string {
  return value.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim();
}

function statusFrom(subject: string, text: string): string | undefined {
  const value = `${subject} ${text.slice(0, 500)}`.toLowerCase();
  if (/cancel(?:led|ed)|closed/.test(value)) return "cancelled";
  if (/complete(?:d)?|order is complete/.test(value)) return "completed";
  if (/deliver(?:ed|y)/.test(value)) return "delivered";
  if (/revision|changes requested/.test(value)) return "changes_requested";
  if (/new order|order started|in progress/.test(value)) return "active";
  return undefined;
}

function parseNotification(provider: MarketplaceProvider, subject: string, body: string, occurredAt?: string) {
  const text = plainText(body).slice(0, 20_000);
  const externalId = `${subject} ${text}`.match(/(?:order|project)(?:\s+(?:number|id))?\s*#?\s*([A-Z0-9][A-Z0-9_-]{4,})/i)?.[1];
  const handle = text.match(/(?:buyer|client|from)\s*:?\s*@?([a-z0-9_.-]{3,40})/i)?.[1];
  const amountMatch = `${subject} ${text}`.match(/(USD|GBP|EUR|[$£€])\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? Math.round(Number.parseFloat(amountMatch[2].replace(/,/g, "")) * 100) : undefined;
  const currency = amountMatch?.[1] === "£" ? "GBP" : amountMatch?.[1] === "€" ? "EUR" : amountMatch?.[1] === "$" ? "USD" : amountMatch?.[1]?.toUpperCase();
  const urlMatch = body.match(/https:\/\/[^\s"'<>]+/g)?.map((value) => value.replace(/&amp;/g, "&")).find((value) => safeMarketplaceUrl(provider, value));
  const cleanedTitle = subject.replace(/^(?:re:|fwd?:)\s*/i, "").replace(/^(?:fiverr\s*[-:|]\s*)/i, "").trim().slice(0, 240) || `${provider} notification`;
  const warnings = ["Notification metadata was extracted automatically. Confirm every field before importing."];
  if (!externalId) warnings.push("No order or project ID was detected.");
  return normalizedMarketplaceItemSchema.parse({
    provider, externalType: amount !== undefined ? "order" : "project", externalId,
    externalUrl: urlMatch ? safeMarketplaceUrl(provider, urlMatch) : undefined, title: cleanedTitle,
    buyer: handle ? { handle } : undefined, status: statusFrom(subject, text),
    financials: amount !== undefined && currency ? { currency, gross: amount } : undefined,
    milestones: [], sourceOccurredAt: occurredAt && !Number.isNaN(new Date(occurredAt).getTime()) ? new Date(occurredAt).toISOString() : undefined,
    confidence: { title: 0.8, externalId: externalId ? 0.75 : 0, buyerHandle: handle ? 0.6 : 0, gross: amount !== undefined ? 0.7 : 0 }, warnings,
  });
}

export async function POST(request: NextRequest) {
  const rawPayload = await request.text();
  if (!verifySvix(rawPayload, request)) return new NextResponse("Invalid signature", { status: 400 });
  let event: ReceivedEvent;
  try { event = JSON.parse(rawPayload) as ReceivedEvent; } catch { return new NextResponse("Invalid payload", { status: 400 }); }
  if (event.type !== "email.received") return NextResponse.json({ received: true });
  const emailId = event.data?.email_id;
  const token = inboundTokenFromRecipients(event.data?.to ?? []);
  if (!emailId || !token) return new NextResponse("Unknown recipient", { status: 400 });

  const connection = await db.marketplaceConnection.findUnique({ where: { inboundTokenHash: hashInboundToken(token) } });
  if (!connection || connection.status === "disabled" || !["fiverr", "freelancer", "upwork", "contra", "generic"].includes(connection.provider)) return new NextResponse("Unknown recipient", { status: 404 });
  const existing = await db.marketplaceImport.findUnique({ where: { organisationId_sourceType_sourceFingerprint: { organisationId: connection.organisationId, sourceType: "email", sourceFingerprint: emailId } }, select: { id: true } });
  if (existing) return NextResponse.json({ received: true, duplicate: true });

  try {
    const received = await retrieveEmail(emailId);
    const subject = event.data?.subject ?? "Marketplace notification";
    const item = parseNotification(connection.provider as MarketplaceProvider, subject, received.text ?? received.html ?? "", event.data?.created_at ?? event.created_at);
    const imported = await db.marketplaceImport.create({
      data: {
        organisationId: connection.organisationId, connectionId: connection.id, provider: connection.provider,
        sourceType: "email", sourceName: subject.slice(0, 240), sourceFingerprint: emailId, itemCount: 1,
        warningSummary: "Forwarded notification metadata needs review.",
        items: { create: { fingerprint: itemFingerprint(item), externalType: item.externalType, externalId: item.externalId, normalizedMetadata: JSON.stringify(item), confidence: JSON.stringify(item.confidence), warnings: JSON.stringify(item.warnings) } },
      },
    });
    await db.marketplaceConnection.update({ where: { id: connection.id }, data: { status: "connected", lastImportedAt: new Date(), lastError: null } });
    const members = await db.organisationMember.findMany({ where: { organisationId: connection.organisationId }, select: { userId: true } });
    if (members.length) await db.notification.createMany({ data: members.map((member) => ({ organisationId: connection.organisationId, userId: member.userId, type: "marketplace.import_ready", title: `Review ${connection.provider} import`, body: subject.slice(0, 180), href: `/integrations/imports/${imported.id}` })) });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await db.marketplaceConnection.update({ where: { id: connection.id }, data: { status: "error", lastError: error instanceof Error ? error.message.slice(0, 240) : "Inbound email failed" } });
    return new NextResponse("Could not process email", { status: 500 });
  }
}
