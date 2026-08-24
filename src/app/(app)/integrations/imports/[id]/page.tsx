import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { getIntegration } from "@/lib/integrations/registry";
import { normalizedMarketplaceItemSchema } from "@/lib/integrations/marketplace";
import { applyMarketplaceImportItemAction, ignoreMarketplaceImportItemAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review marketplace import" };

export default async function MarketplaceImportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAppContext();
  const imported = await db.marketplaceImport.findFirst({
    where: { id, organisationId: ctx.org.id },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!imported) notFound();
  const definition = getIntegration(imported.provider);
  if (!definition) notFound();
  const [clients, projects, existingLinks] = await Promise.all([
    db.client.findMany({ where: { organisationId: ctx.org.id }, orderBy: [{ company: "asc" }, { name: "asc" }], select: { id: true, name: true, company: true, email: true } }),
    db.project.findMany({ where: { organisationId: ctx.org.id }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, slug: true } }),
    db.marketplaceLink.findMany({ where: { organisationId: ctx.org.id, provider: imported.provider, externalType: "project" }, select: { externalId: true, projectId: true } }),
  ]);
  const linkByExternalId = new Map(existingLinks.map((link) => [link.externalId, link.projectId]));

  return (
    <div className="min-h-full bg-workbench">
      <header className="border-b border-border bg-background px-4 py-5 sm:px-6 lg:px-8">
        <Link href={`/integrations/${imported.provider}`} className="mb-4 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">← {definition.name}</Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4"><IntegrationLogo integration={definition} /><div><h1 className="text-xl font-semibold tracking-tight">Review import</h1><p className="mt-0.5 text-[13px] text-muted-foreground">{imported.sourceName ?? imported.sourceType} · {imported.itemCount} item{imported.itemCount === 1 ? "" : "s"}</p></div></div>
          <Badge tone={imported.status === "completed" ? "success" : imported.status === "failed" ? "danger" : imported.status === "partially_completed" ? "warning" : "accent"}>{imported.status.replaceAll("_", " ")}</Badge>
        </div>
        <div className="mt-5 grid max-w-xl grid-cols-4 gap-2 text-center"><Metric label="Pending" value={imported.itemCount - imported.importedCount - imported.ignoredCount - imported.errorCount} /><Metric label="Imported" value={imported.importedCount} /><Metric label="Ignored" value={imported.ignoredCount} /><Metric label="Errors" value={imported.errorCount} /></div>
      </header>

      <div className="mx-auto max-w-[1000px] space-y-4 p-4 sm:p-6 lg:p-8">
        {imported.items.map((row, index) => {
          const parsed = normalizedMarketplaceItemSchema.safeParse(JSON.parse(row.normalizedMetadata));
          if (!parsed.success) return <div key={row.id} className="rounded-xl border border-danger/30 bg-background p-5 text-[13px] text-danger">Item {index + 1} contains invalid normalized metadata.</div>;
          const item = parsed.data;
          const linkedProjectId = linkByExternalId.get(item.externalId ?? row.fingerprint);
          const warnings = item.warnings;
          return (
            <article key={row.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
              <div className="flex flex-col gap-3 border-b border-border bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-2xs font-semibold text-muted-foreground">{index + 1}</span><h2 className="truncate text-sm font-semibold">{item.title}</h2></div><div className="mt-1 text-2xs text-muted-foreground">{item.externalId ? `External ID ${item.externalId}` : "No external ID"}{item.buyer?.handle ? ` · @${item.buyer.handle.replace(/^@/, "")}` : ""}</div></div>
                <div className="flex items-center gap-2"><Badge tone={row.reviewStatus === "imported" ? "success" : row.reviewStatus === "error" ? "danger" : row.reviewStatus === "ignored" ? "neutral" : "accent"}>{row.reviewStatus}</Badge>{linkedProjectId && row.reviewStatus === "pending" ? <Badge tone="warning">Existing link found</Badge> : null}</div>
              </div>

              {row.reviewStatus === "pending" ? (
                <form action={applyMarketplaceImportItemAction.bind(null, row.id)} className="p-5">
                  {warnings.length ? <div className="mb-4 rounded-lg border border-warning/25 bg-warning/[0.06] px-3 py-2 text-xs text-muted-foreground">{warnings.join(" ")}</div> : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReviewField name="title" label="Project / order title" defaultValue={item.title} required />
                    <ReviewField name="externalUrl" label="Marketplace URL" type="url" defaultValue={item.externalUrl} />
                    <ReviewField name="buyerName" label="Buyer name or handle" defaultValue={item.buyer?.displayName ?? item.buyer?.handle} />
                    <label className="space-y-1"><span className="text-xs font-medium">Link to an existing client</span><select name="existingClientId" className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px]"><option value="">No existing client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company ?? client.name}{client.email ? ` · ${client.email}` : " · marketplace only"}</option>)}</select></label>
                    <label className="space-y-1"><span className="text-xs font-medium">Link to an existing project</span><select name="existingProjectId" defaultValue={linkedProjectId ?? ""} className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px]"><option value="">No existing project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                    <div className="rounded-lg border border-border bg-surface/50 p-3 text-xs">
                      <div className="font-medium">Source metadata</div>
                      <dl className="mt-2 space-y-1 text-muted-foreground"><Meta label="Status" value={item.status ?? "Not supplied"} /><Meta label="Due" value={item.dueAt ? formatDate(item.dueAt) : "Not supplied"} />{item.financials ? <Meta label="Amount" value={formatMoney(item.financials.net ?? item.financials.gross ?? 0, item.financials.currency)} /> : null}</dl>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 rounded-lg border border-border p-3 text-xs sm:grid-cols-2">
                    <Check name="createProject" label="Create a project when none is selected" defaultChecked />
                    <Check name="createClient" label="Create a marketplace-only client" defaultChecked={Boolean(item.buyer?.displayName || item.buyer?.handle)} />
                    {item.milestones.length ? <Check name="importMilestones" label={`Import ${item.milestones.length} milestone${item.milestones.length === 1 ? "" : "s"}`} defaultChecked /> : null}
                    {item.financials ? <Check name="importEarning" label="Add to marketplace earnings" defaultChecked /> : null}
                    <Check name="openProject" label="Open the project after import" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2"><Button size="sm">Apply reviewed item</Button><button formAction={ignoreMarketplaceImportItemAction.bind(null, row.id)} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[13px] font-medium hover:bg-muted">Ignore</button><span className="ml-auto text-2xs text-muted-foreground">No marketplace message, file or raw email will be stored.</span></div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4 px-5 py-4 text-[13px] text-muted-foreground"><span>{row.reviewStatus === "imported" ? "This item was reviewed and applied." : row.reviewStatus === "ignored" ? "This item was ignored." : row.errorMessage ?? "This item could not be imported."}</span>{row.projectId && projects.find((project) => project.id === row.projectId) ? <Link href={`/projects/${projects.find((project) => project.id === row.projectId)!.slug}`} className="text-xs font-semibold text-foreground">Open project</Link> : null}</div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-border bg-surface px-3 py-2"><div className="font-mono text-base font-semibold">{value}</div><div className="text-2xs text-muted-foreground">{label}</div></div>; }
function ReviewField(props: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) { const { label, ...input } = props; return <label className="space-y-1"><span className="text-xs font-medium">{label}</span><input {...input} className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring" /></label>; }
function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) { return <label className="flex items-center gap-2"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 rounded border-border accent-foreground" /><span>{label}</span></label>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-medium text-foreground">{value}</dd></div>; }
