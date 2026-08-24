"use client";

import { useState } from "react";
import { uploadMarketplaceCsvAction } from "@/app/(app)/integrations/actions";
import { csvCanonicalFields, parseCsv, suggestCsvMapping, type CsvMapping, type MarketplaceProvider } from "@/lib/integrations/marketplace";

const FIELD_LABELS: Record<(typeof csvCanonicalFields)[number], string> = {
  externalId: "External ID", title: "Project / order title", buyerHandle: "Buyer handle", buyerName: "Buyer name",
  status: "Status", startedAt: "Start date", dueAt: "Due date", completedAt: "Completion date", gross: "Gross amount",
  net: "Net earnings", fee: "Marketplace fee", currency: "Currency", externalUrl: "Marketplace URL", sourceOccurredAt: "Event date", milestoneTitle: "Milestone title",
};

export function CsvImportForm({ provider }: { provider: MarketplaceProvider }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [fileName, setFileName] = useState("");

  return (
    <form action={uploadMarketplaceCsvAction} className="space-y-4">
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
      <label className="block rounded-xl border border-dashed border-border bg-surface/50 p-5 text-center transition-colors hover:border-foreground/30">
        <span className="block text-sm font-medium">{fileName || "Choose a marketplace CSV"}</span>
        <span className="mt-1 block text-xs text-muted-foreground">UTF-8 CSV, TSV or semicolon-delimited · up to 5 MB</span>
        <input name="file" type="file" accept=".csv,text/csv,text/tab-separated-values" required className="sr-only" onChange={async (event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name ?? "");
          if (!file) { setHeaders([]); setMapping({}); return; }
          const text = await file.slice(0, 64_000).text();
          const parsedHeaders = parseCsv(text)[0] ?? [];
          setHeaders(parsedHeaders);
          setMapping(suggestCsvMapping(parsedHeaders));
        }} />
      </label>
      {headers.length ? (
        <div>
          <div className="mb-2 text-xs font-medium">Map your columns</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {csvCanonicalFields.map((field) => (
              <label key={field} className="grid grid-cols-[1fr_1.2fr] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-xs text-muted-foreground">{FIELD_LABELS[field]}</span>
                <select value={mapping[field] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [field]: event.target.value || undefined }))} className="min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Not mapped</option>
                  {headers.map((header, index) => <option key={`${header}-${index}`} value={header}>{header || `Column ${index + 1}`}</option>)}
                </select>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <button type="submit" disabled={!fileName} className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:opacity-50">Create review import</button>
    </form>
  );
}
