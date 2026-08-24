import { z } from "zod";
import type { IntegrationProvider } from "@/lib/integrations/registry";

export const marketplaceProviders = ["fiverr", "freelancer", "upwork", "contra", "generic"] as const;
export type MarketplaceProvider = (typeof marketplaceProviders)[number];

const optionalDate = z.string().datetime().optional();
export const normalizedMarketplaceItemSchema = z.object({
  provider: z.enum(marketplaceProviders),
  externalType: z.enum(["order", "project", "milestone", "earning"]).default("project"),
  externalId: z.string().max(240).optional(),
  externalUrl: z.string().url().optional(),
  title: z.string().min(1).max(240),
  buyer: z.object({
    externalId: z.string().max(240).optional(),
    handle: z.string().max(240).optional(),
    displayName: z.string().max(240).optional(),
  }).optional(),
  status: z.string().max(80).optional(),
  startedAt: optionalDate,
  dueAt: optionalDate,
  completedAt: optionalDate,
  financials: z.object({
    currency: z.string().length(3),
    gross: z.number().int().optional(),
    net: z.number().int().optional(),
    fee: z.number().int().optional(),
  }).optional(),
  milestones: z.array(z.object({
    externalId: z.string().max(240).optional(),
    title: z.string().min(1).max(240),
    status: z.string().max(80).optional(),
    dueAt: optionalDate,
    amount: z.number().int().optional(),
    currency: z.string().length(3).optional(),
  })).max(50).default([]),
  sourceOccurredAt: optionalDate,
  confidence: z.record(z.number().min(0).max(1)).default({}),
  warnings: z.array(z.string().max(240)).max(30).default([]),
});

export type NormalizedMarketplaceItem = z.infer<typeof normalizedMarketplaceItemSchema>;

export const csvCanonicalFields = [
  "externalId", "title", "buyerHandle", "buyerName", "status", "startedAt", "dueAt", "completedAt",
  "gross", "net", "fee", "currency", "externalUrl", "sourceOccurredAt", "milestoneTitle",
] as const;
export type CsvCanonicalField = (typeof csvCanonicalFields)[number];
export type CsvMapping = Partial<Record<CsvCanonicalField, string>>;

const ALIASES: Record<CsvCanonicalField, string[]> = {
  externalId: ["external id", "order id", "order", "project id", "transaction id", "id"],
  title: ["title", "project title", "order title", "project", "service", "gig", "description"],
  buyerHandle: ["buyer handle", "buyer username", "username", "buyer", "client handle", "from"],
  buyerName: ["buyer name", "client name", "customer", "client"],
  status: ["status", "order status", "project status", "activity type", "type"],
  startedAt: ["start date", "started", "created date", "created at"],
  dueAt: ["due date", "deadline", "delivery date", "due at"],
  completedAt: ["completed date", "completed at", "completion date"],
  gross: ["gross", "gross amount", "order amount", "total"],
  net: ["net", "net amount", "earnings", "amount"],
  fee: ["fee", "service fee", "marketplace fee"],
  currency: ["currency", "currency code"],
  externalUrl: ["url", "link", "order url", "project url"],
  sourceOccurredAt: ["date", "transaction date", "activity date", "timestamp"],
  milestoneTitle: ["milestone", "milestone title"],
};

function normalizedHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function suggestCsvMapping(headers: string[]): CsvMapping {
  const result: CsvMapping = {};
  const normalized = headers.map(normalizedHeader);
  for (const field of csvCanonicalFields) {
    const index = normalized.findIndex((header) => ALIASES[field].includes(header));
    if (index >= 0) result[field] = headers[index];
  }
  return result;
}

export function detectCsvDelimiter(text: string): "," | ";" | "\t" {
  const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (const character of firstLine) {
    if (character === '"') quoted = !quoted;
    else if (!quoted && (character === "," || character === ";" || character === "\t")) counts[character] += 1;
  }
  return counts["\t"] > counts[","] && counts["\t"] > counts[";"] ? "\t" : counts[";"] > counts[","] ? ";" : ",";
}

export function parseCsv(text: string): string[][] {
  const delimiter = detectCsvDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const character = source[i];
    if (character === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function parseDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function currencyFrom(value?: string, ...amounts: Array<string | undefined>): string {
  const explicit = value?.trim().toUpperCase();
  if (explicit && /^[A-Z]{3}$/.test(explicit)) return explicit;
  const combined = amounts.join(" ");
  if (combined.includes("£")) return "GBP";
  if (combined.includes("€")) return "EUR";
  return "USD";
}

function minorUnits(value?: string): number | undefined {
  if (!value) return undefined;
  const negative = /^\s*\(.*\)\s*$/.test(value) || /^\s*-/.test(value);
  const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(Math.abs(parsed) * 100) * (negative ? -1 : 1) : undefined;
}

const PROVIDER_HOSTS: Partial<Record<MarketplaceProvider, string[]>> = {
  fiverr: ["fiverr.com", "www.fiverr.com"], freelancer: ["freelancer.com", "www.freelancer.com"],
  upwork: ["upwork.com", "www.upwork.com"], contra: ["contra.com", "www.contra.com"],
};

export function safeMarketplaceUrl(provider: MarketplaceProvider, value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return undefined;
    const allowed = PROVIDER_HOSTS[provider];
    if (allowed && !allowed.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return undefined;
    if (!allowed && !Object.values(PROVIDER_HOSTS).flat().some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return undefined;
    return url.toString();
  } catch { return undefined; }
}

export function normalizeCsv(text: string, provider: MarketplaceProvider, mapping?: CsvMapping): NormalizedMarketplaceItem[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  const selected = mapping && Object.keys(mapping).length ? mapping : suggestCsvMapping(headers);
  const indexes = Object.fromEntries(Object.entries(selected).map(([field, header]) => [field, headers.indexOf(header)])) as Partial<Record<CsvCanonicalField, number>>;
  const at = (row: string[], field: CsvCanonicalField) => {
    const index = indexes[field];
    return index === undefined || index < 0 ? undefined : row[index]?.trim() || undefined;
  };

  return rows.slice(1, 10_001).map((row, index) => {
    const externalId = at(row, "externalId");
    const rawTitle = at(row, "title");
    const buyerHandle = at(row, "buyerHandle");
    const buyerName = at(row, "buyerName");
    const grossRaw = at(row, "gross");
    const netRaw = at(row, "net");
    const feeRaw = at(row, "fee");
    const gross = minorUnits(grossRaw);
    const net = minorUnits(netRaw);
    const fee = minorUnits(feeRaw);
    const currency = currencyFrom(at(row, "currency"), grossRaw, netRaw, feeRaw);
    const dueAt = parseDate(at(row, "dueAt"));
    const sourceOccurredAt = parseDate(at(row, "sourceOccurredAt"));
    const warnings: string[] = [];
    if (!rawTitle) warnings.push("No title column was mapped; review the generated title.");
    if (at(row, "dueAt") && !dueAt) warnings.push("The due date could not be parsed.");
    const milestoneTitle = at(row, "milestoneTitle");
    return normalizedMarketplaceItemSchema.parse({
      provider,
      externalType: gross !== undefined || net !== undefined || fee !== undefined ? "order" : "project",
      externalId,
      externalUrl: safeMarketplaceUrl(provider, at(row, "externalUrl")),
      title: rawTitle ?? externalId ?? `Imported row ${index + 1}`,
      buyer: buyerHandle || buyerName ? { handle: buyerHandle, displayName: buyerName } : undefined,
      status: at(row, "status"),
      startedAt: parseDate(at(row, "startedAt")), dueAt, completedAt: parseDate(at(row, "completedAt")),
      financials: gross !== undefined || net !== undefined || fee !== undefined ? { currency, gross, net, fee } : undefined,
      milestones: milestoneTitle ? [{ title: milestoneTitle, dueAt, currency }] : [],
      sourceOccurredAt,
      confidence: Object.fromEntries(Object.entries(selected).map(([field]) => [field, 0.8])), warnings,
    });
  });
}

export function isMarketplaceProvider(value: string): value is MarketplaceProvider {
  return marketplaceProviders.includes(value as MarketplaceProvider);
}

export function marketplaceProviderFromIntegration(value: IntegrationProvider): MarketplaceProvider | null {
  return isMarketplaceProvider(value) ? value : null;
}
