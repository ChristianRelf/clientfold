"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { assertRole, requireOrg } from "@/lib/tenancy";
import { uniqueSlug } from "@/lib/slug";
import {
  csvCanonicalFields,
  isMarketplaceProvider,
  normalizeCsv,
  normalizedMarketplaceItemSchema,
  safeMarketplaceUrl,
  type CsvMapping,
  type MarketplaceProvider,
  type NormalizedMarketplaceItem,
} from "@/lib/integrations/marketplace";
import { itemFingerprint } from "@/lib/integrations/marketplace-server";
import { hashInboundToken, inboundTokenForConnection } from "@/lib/integrations/inbound";
import type { IntegrationProvider } from "@/lib/integrations/registry";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeMapping(value: FormDataEntryValue | null): CsvMapping {
  if (typeof value !== "string") return {};
  try {
    const raw = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(raw).filter(([key, item]) => csvCanonicalFields.includes(key as (typeof csvCanonicalFields)[number]) && typeof item === "string" && item.length <= 240)) as CsvMapping;
  } catch { return {}; }
}

async function ensureConnection(organisationId: string, provider: MarketplaceProvider) {
  const existing = await db.marketplaceConnection.findFirst({ where: { organisationId, provider }, orderBy: { createdAt: "asc" } });
  return existing ?? db.marketplaceConnection.create({ data: { organisationId, provider, label: provider === "generic" ? "CSV import" : undefined } });
}

async function createReviewImport(params: {
  organisationId: string;
  provider: MarketplaceProvider;
  sourceType: "csv" | "manual" | "email";
  sourceName?: string;
  sourceFingerprint: string;
  items: NormalizedMarketplaceItem[];
}) {
  const existing = await db.marketplaceImport.findUnique({
    where: { organisationId_sourceType_sourceFingerprint: { organisationId: params.organisationId, sourceType: params.sourceType, sourceFingerprint: params.sourceFingerprint } },
    select: { id: true },
  });
  if (existing) return existing;
  const connection = await ensureConnection(params.organisationId, params.provider);
  const created = await db.marketplaceImport.create({
    data: {
      organisationId: params.organisationId,
      connectionId: connection.id,
      provider: params.provider,
      sourceType: params.sourceType,
      sourceName: params.sourceName,
      sourceFingerprint: params.sourceFingerprint,
      itemCount: params.items.length,
      warningSummary: params.items.some((item) => item.warnings.length) ? "Some fields need your attention before import." : null,
      items: {
        create: params.items.map((item) => ({
          fingerprint: itemFingerprint(item),
          externalType: item.externalType,
          externalId: item.externalId,
          normalizedMetadata: JSON.stringify(item),
          confidence: JSON.stringify(item.confidence),
          warnings: JSON.stringify(item.warnings),
        })),
      },
    },
  });
  // A user-provided file is an import source, not a live provider connection.
  await db.marketplaceConnection.update({ where: { id: connection.id }, data: { lastImportedAt: new Date() } });
  return created;
}

export async function uploadMarketplaceCsvAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  const providerValue = String(formData.get("provider") ?? "");
  if (!isMarketplaceProvider(providerValue)) redirect("/integrations?error=provider");
  const file = formData.get("file");
  if (!(file instanceof File) || !file.name || file.size === 0 || file.size > MAX_CSV_BYTES) redirect(`/integrations/${providerValue}?error=file`);
  const text = await file.text();
  const rows = normalizeCsv(text, providerValue, safeMapping(formData.get("mapping")));
  if (!rows.length) redirect(`/integrations/${providerValue}?error=empty`);
  const imported = await createReviewImport({
    organisationId: ctx.org.id,
    provider: providerValue,
    sourceType: "csv",
    sourceName: file.name.slice(0, 240),
    sourceFingerprint: hash(`${providerValue}\0${text}`),
    items: rows,
  });
  await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "marketplace.import_created", targetType: "MarketplaceImport", targetId: imported.id, metadata: JSON.stringify({ provider: providerValue, sourceType: "csv", count: rows.length }) } });
  redirect(`/integrations/imports/${imported.id}`);
}

const manualSchema = z.object({
  provider: z.enum(["fiverr", "freelancer", "upwork", "contra", "generic"]),
  title: z.string().min(1).max(240), externalId: z.string().max(240).optional(), externalUrl: z.string().max(1000).optional(),
  buyerHandle: z.string().max(240).optional(), buyerName: z.string().max(240).optional(), status: z.string().max(80).optional(),
  dueAt: z.string().optional(), amount: z.string().optional(), currency: z.string().length(3).default("USD"),
});

export async function createManualMarketplaceImportAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  const parsed = manualSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/integrations/${String(formData.get("provider") ?? "generic")}?error=manual`);
  const data = parsed.data;
  const due = data.dueAt ? new Date(data.dueAt) : null;
  const amountNumber = data.amount ? Number.parseFloat(data.amount.replace(/[^0-9.-]/g, "")) : Number.NaN;
  const item = normalizedMarketplaceItemSchema.parse({
    provider: data.provider, externalType: "project", externalId: data.externalId || undefined,
    externalUrl: safeMarketplaceUrl(data.provider, data.externalUrl), title: data.title,
    buyer: data.buyerHandle || data.buyerName ? { handle: data.buyerHandle || undefined, displayName: data.buyerName || undefined } : undefined,
    status: data.status || undefined, dueAt: due && !Number.isNaN(due.getTime()) ? due.toISOString() : undefined,
    financials: Number.isFinite(amountNumber) ? { currency: data.currency.toUpperCase(), gross: Math.round(amountNumber * 100) } : undefined,
    milestones: [], confidence: { title: 1 }, warnings: [],
  });
  const imported = await createReviewImport({ organisationId: ctx.org.id, provider: data.provider, sourceType: "manual", sourceName: data.title, sourceFingerprint: hash(`${ctx.user.id}\0${Date.now()}\0${JSON.stringify(item)}`), items: [item] });
  redirect(`/integrations/imports/${imported.id}`);
}

export async function enableMarketplaceForwardingAction(provider: MarketplaceProvider): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  const connection = await ensureConnection(ctx.org.id, provider);
  const token = inboundTokenForConnection(connection.id);
  await db.marketplaceConnection.update({ where: { id: connection.id }, data: { inboundTokenHash: hashInboundToken(token), status: "connected", lastError: null } });
  await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "marketplace.forwarding_enabled", targetType: "MarketplaceConnection", targetId: connection.id, metadata: JSON.stringify({ provider }) } });
  revalidatePath(`/integrations/${provider}`);
  revalidatePath("/integrations");
}

export async function disableMarketplaceConnectionAction(connectionId: string): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  const connection = await db.marketplaceConnection.findFirst({ where: { id: connectionId, organisationId: ctx.org.id } });
  if (!connection) return;
  await db.marketplaceConnection.update({ where: { id: connection.id }, data: { status: "disabled", inboundTokenHash: null } });
  await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "marketplace.connection_disabled", targetType: "MarketplaceConnection", targetId: connection.id, metadata: JSON.stringify({ provider: connection.provider }) } });
  revalidatePath(`/integrations/${connection.provider}`);
  revalidatePath("/integrations");
}

export async function disableStripeIntegrationAction(): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  await db.organisation.update({ where: { id: ctx.org.id }, data: { stripeConnectComplete: false } });
  await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "integration.stripe_disabled", targetType: "Organisation", targetId: ctx.org.id } });
  revalidatePath("/integrations");
  revalidatePath("/integrations/stripe");
  revalidatePath("/settings");
}

export async function disableLegacyIntegrationAction(provider: IntegrationProvider): Promise<void> {
  const ctx = await getAppContext();
  const orgCtx = await requireOrg(ctx.org.slug);
  assertRole(orgCtx, "admin");
  if (["fiverr", "freelancer", "upwork", "contra", "generic", "stripe"].includes(provider)) return;
  const integration = await db.integration.findFirst({ where: { organisationId: ctx.org.id, provider } });
  if (!integration) return;
  await db.integration.update({ where: { id: integration.id }, data: { status: "disconnected" } });
  await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "integration.disabled", targetType: "Integration", targetId: integration.id, metadata: JSON.stringify({ provider }) } });
  revalidatePath("/integrations");
  revalidatePath(`/integrations/${provider}`);
}

async function refreshImportCounts(importId: string) {
  const items = await db.marketplaceImportItem.findMany({ where: { importId }, select: { reviewStatus: true } });
  const importedCount = items.filter((item) => item.reviewStatus === "imported").length;
  const ignoredCount = items.filter((item) => item.reviewStatus === "ignored").length;
  const errorCount = items.filter((item) => item.reviewStatus === "error").length;
  const pending = items.some((item) => item.reviewStatus === "pending");
  const status = pending ? "pending_review" : errorCount && (importedCount || ignoredCount) ? "partially_completed" : errorCount ? "failed" : "completed";
  await db.marketplaceImport.update({ where: { id: importId }, data: { importedCount, ignoredCount, errorCount, status, reviewedAt: new Date(), completedAt: pending ? null : new Date() } });
}

function localProjectStatus(remote?: string): string {
  const value = remote?.toLowerCase() ?? "";
  if (["complete", "completed", "paid", "closed", "delivered"].includes(value)) return "completed";
  if (["cancelled", "canceled", "archived"].includes(value)) return "archived";
  return "active";
}

export async function applyMarketplaceImportItemAction(itemId: string, formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  const item = await db.marketplaceImportItem.findFirst({ where: { id: itemId, import: { organisationId: ctx.org.id } }, include: { import: true } });
  if (!item || item.reviewStatus !== "pending") return;
  const metadata = normalizedMarketplaceItemSchema.parse(JSON.parse(item.normalizedMetadata));
  const title = String(formData.get("title") ?? metadata.title).trim().slice(0, 240) || metadata.title;
  const externalUrl = safeMarketplaceUrl(metadata.provider, String(formData.get("externalUrl") ?? metadata.externalUrl ?? ""));
  const buyerName = String(formData.get("buyerName") ?? metadata.buyer?.displayName ?? metadata.buyer?.handle ?? "").trim().slice(0, 240);
  const existingClientId = String(formData.get("existingClientId") ?? "");
  const existingProjectId = String(formData.get("existingProjectId") ?? "");
  const shouldCreateClient = formData.get("createClient") === "on";
  const shouldCreateProject = formData.get("createProject") === "on";
  const shouldImportEarning = formData.get("importEarning") === "on" && Boolean(metadata.financials);
  const shouldImportMilestones = formData.get("importMilestones") === "on";

  try {
    let clientId: string | undefined;
    if (existingClientId) {
      clientId = (await db.client.findFirst({ where: { id: existingClientId, organisationId: ctx.org.id }, select: { id: true } }))?.id;
    } else if (shouldCreateClient && buyerName) {
      const buyerExternalId = metadata.buyer?.externalId ?? metadata.buyer?.handle;
      const existingLink = buyerExternalId ? await db.marketplaceLink.findUnique({ where: { organisationId_provider_externalType_externalId: { organisationId: ctx.org.id, provider: metadata.provider, externalType: "client", externalId: buyerExternalId } }, select: { clientId: true } }) : null;
      if (existingLink?.clientId) clientId = existingLink.clientId;
      else {
        const client = await db.client.create({ data: { organisationId: ctx.org.id, name: buyerName, email: null, status: "active", notes: `Imported ${metadata.provider} client${metadata.buyer?.handle ? ` · @${metadata.buyer.handle.replace(/^@/, "")}` : ""}` } });
        clientId = client.id;
        if (buyerExternalId) await db.marketplaceLink.create({ data: { organisationId: ctx.org.id, connectionId: item.import.connectionId, provider: metadata.provider, externalType: "client", externalId: buyerExternalId, clientId } });
      }
    }

    let projectId: string | undefined;
    let projectSlug: string | undefined;
    if (existingProjectId) {
      const project = await db.project.findFirst({ where: { id: existingProjectId, organisationId: ctx.org.id }, select: { id: true, slug: true } });
      if (project) {
        projectId = project.id; projectSlug = project.slug;
        await db.project.update({ where: { id: project.id }, data: { name: title, targetDate: metadata.dueAt ? new Date(metadata.dueAt) : undefined, status: localProjectStatus(metadata.status) } });
      }
    } else if (shouldCreateProject) {
      projectSlug = await uniqueSlug(title, async (slug) => Boolean(await db.project.findFirst({ where: { organisationId: ctx.org.id, slug }, select: { id: true } })));
      const project = await db.project.create({ data: { organisationId: ctx.org.id, name: title, slug: projectSlug, status: localProjectStatus(metadata.status), startDate: metadata.startedAt ? new Date(metadata.startedAt) : undefined, targetDate: metadata.dueAt ? new Date(metadata.dueAt) : undefined, members: { create: { userId: ctx.user.id, role: "owner" } }, clients: clientId ? { create: { clientId } } : undefined } });
      projectId = project.id;
    }
    if (projectId && clientId) await db.projectClient.upsert({ where: { projectId_clientId: { projectId, clientId } }, create: { projectId, clientId }, update: {} });

    const externalId = metadata.externalId ?? item.fingerprint;
    if (projectId) {
      await db.marketplaceLink.upsert({
        where: { organisationId_provider_externalType_externalId: { organisationId: ctx.org.id, provider: metadata.provider, externalType: "project", externalId } },
        create: { organisationId: ctx.org.id, connectionId: item.import.connectionId, provider: metadata.provider, externalType: "project", externalId, externalUrl, projectId, remoteStatus: metadata.status, remoteUpdatedAt: metadata.sourceOccurredAt ? new Date(metadata.sourceOccurredAt) : undefined },
        update: { externalUrl, projectId, remoteStatus: metadata.status, remoteUpdatedAt: metadata.sourceOccurredAt ? new Date(metadata.sourceOccurredAt) : undefined, lastImportedAt: new Date() },
      });
    }

    let milestoneId: string | undefined;
    if (projectId && shouldImportMilestones && metadata.milestones.length) {
      for (let index = 0; index < metadata.milestones.length; index += 1) {
        const milestone = metadata.milestones[index];
        const milestoneExternalId = milestone.externalId ?? `${externalId}:milestone:${index + 1}`;
        const priorLink = await db.marketplaceLink.findUnique({
          where: { organisationId_provider_externalType_externalId: { organisationId: ctx.org.id, provider: metadata.provider, externalType: "milestone", externalId: milestoneExternalId } },
          select: { id: true, milestoneId: true },
        });
        if (priorLink?.milestoneId) {
          await db.milestone.update({
            where: { id: priorLink.milestoneId },
            data: { projectId, title: milestone.title, dueDate: milestone.dueAt ? new Date(milestone.dueAt) : undefined, status: localProjectStatus(milestone.status) === "completed" ? "complete" : "upcoming", order: index + 1 },
          });
          milestoneId ??= priorLink.milestoneId;
          await db.marketplaceLink.update({ where: { id: priorLink.id }, data: { externalUrl, projectId, remoteStatus: milestone.status, lastImportedAt: new Date() } });
        } else {
          const created = await db.milestone.create({ data: { projectId, title: milestone.title, dueDate: milestone.dueAt ? new Date(milestone.dueAt) : undefined, status: localProjectStatus(milestone.status) === "completed" ? "complete" : "upcoming", order: index + 1 } });
          milestoneId ??= created.id;
          await db.marketplaceLink.create({ data: { organisationId: ctx.org.id, connectionId: item.import.connectionId, provider: metadata.provider, externalType: "milestone", externalId: milestoneExternalId, externalUrl, projectId, milestoneId: created.id, remoteStatus: milestone.status } });
        }
      }
    }

    let earningId: string | undefined;
    if (shouldImportEarning && metadata.financials) {
      const transactionId = `${metadata.externalId ?? item.fingerprint}:${metadata.sourceOccurredAt ?? "transaction"}`;
      const earning = await db.marketplaceEarning.upsert({
        where: { organisationId_provider_externalTransactionId: { organisationId: ctx.org.id, provider: metadata.provider, externalTransactionId: transactionId } },
        create: { organisationId: ctx.org.id, importId: item.importId, projectId, clientId, provider: metadata.provider, externalTransactionId: transactionId, transactionType: metadata.externalType, grossAmount: metadata.financials.gross, netAmount: metadata.financials.net, feeAmount: metadata.financials.fee, currency: metadata.financials.currency, occurredAt: metadata.sourceOccurredAt ? new Date(metadata.sourceOccurredAt) : undefined },
        update: { projectId, clientId, grossAmount: metadata.financials.gross, netAmount: metadata.financials.net, feeAmount: metadata.financials.fee, currency: metadata.financials.currency, occurredAt: metadata.sourceOccurredAt ? new Date(metadata.sourceOccurredAt) : undefined },
      });
      earningId = earning.id;
    }

    await db.marketplaceImportItem.update({ where: { id: item.id }, data: { reviewStatus: "imported", proposedAction: existingProjectId ? "update" : shouldCreateProject ? "create" : "link", clientId, projectId, milestoneId, earningId, reviewedAt: new Date(), errorMessage: null } });
    await db.activity.create({ data: { organisationId: ctx.org.id, projectId, type: "marketplace.project_imported", actorType: "user", actorId: ctx.user.id, actorName: ctx.user.name ?? "You", summary: `${ctx.user.name ?? "You"} imported ${title} from ${metadata.provider}`, metadata: JSON.stringify({ provider: metadata.provider, externalType: metadata.externalType }) } });
    await db.auditLog.create({ data: { organisationId: ctx.org.id, actorId: ctx.user.id, actorName: ctx.user.name ?? ctx.user.email, action: "marketplace.import_item_applied", targetType: "MarketplaceImportItem", targetId: item.id, metadata: JSON.stringify({ provider: metadata.provider, projectId }) } });
    await refreshImportCounts(item.importId);
    revalidatePath("/integrations"); revalidatePath(`/integrations/${metadata.provider}`); revalidatePath(`/integrations/imports/${item.importId}`); revalidatePath("/projects");
    if (projectSlug && formData.get("openProject") === "on") redirect(`/projects/${projectSlug}`);
  } catch (error) {
    await db.marketplaceImportItem.update({ where: { id: item.id }, data: { reviewStatus: "error", errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Import failed", reviewedAt: new Date() } });
    await refreshImportCounts(item.importId);
  }
}

export async function ignoreMarketplaceImportItemAction(itemId: string): Promise<void> {
  const ctx = await getAppContext();
  const item = await db.marketplaceImportItem.findFirst({ where: { id: itemId, import: { organisationId: ctx.org.id } }, select: { id: true, importId: true, reviewStatus: true } });
  if (!item || item.reviewStatus !== "pending") return;
  await db.marketplaceImportItem.update({ where: { id: item.id }, data: { reviewStatus: "ignored", proposedAction: "ignore", reviewedAt: new Date() } });
  await refreshImportCounts(item.importId);
  revalidatePath(`/integrations/imports/${item.importId}`);
}
