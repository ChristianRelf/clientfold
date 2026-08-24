import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { CsvImportForm } from "@/components/integrations/csv-import-form";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { CATEGORY_LABELS, getIntegration } from "@/lib/integrations/registry";
import { marketplaceProviderFromIntegration } from "@/lib/integrations/marketplace";
import { inboundAddressForConnection } from "@/lib/integrations/inbound";
import { deriveWebhookSecret, parseWebhookEvents, WEBHOOK_EVENTS } from "@/lib/integrations/webhooks";
import { formatDate, formatMoney, relativeTime } from "@/lib/format";
import { connectStripeAction } from "@/app/(app)/settings/actions";
import { createManualMarketplaceImportAction, disableLegacyIntegrationAction, disableMarketplaceConnectionAction, disableStripeIntegrationAction, enableMarketplaceForwardingAction } from "../actions";
import { createWebhookEndpointAction, retryWebhookDeliveryAction, rotateWebhookSecretAction, sendWebhookTestAction, setWebhookEndpointStatusAction } from "../webhook-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return { title: getIntegration(provider)?.name ?? "Integration" };
}

function Status({ runtime, availability }: { runtime?: string; availability: string }) {
  if (runtime === "connected") return <Badge tone="success">Connected</Badge>;
  if (runtime === "error") return <Badge tone="danger">Error</Badge>;
  if (runtime === "disabled" || runtime === "disconnected") return <Badge tone="neutral">Setup required</Badge>;
  if (availability === "import_only") return <Badge tone="success">Import available</Badge>;
  if (availability === "approval_required") return <Badge tone="warning">Requires provider approval</Badge>;
  if (availability === "coming_soon") return <Badge tone="neutral">Coming soon</Badge>;
  return <Badge tone="accent">Available</Badge>;
}

export default async function IntegrationDetailPage({ params, searchParams }: { params: Promise<{ provider: string }>; searchParams: Promise<{ error?: string; connected?: string; created?: string; tested?: string }> }) {
  const [{ provider }, query] = await Promise.all([params, searchParams]);
  const definition = getIntegration(provider);
  if (!definition) notFound();
  const ctx = await getAppContext();
  const marketplaceProvider = marketplaceProviderFromIntegration(definition.provider);
  const [org, connections, recentImports, recentEarnings, legacyConnection, webhookEndpoints, webhookDeliveries] = await Promise.all([
    db.organisation.findUnique({ where: { id: ctx.org.id }, select: { stripeConnectComplete: true } }),
    marketplaceProvider ? db.marketplaceConnection.findMany({ where: { organisationId: ctx.org.id, provider: marketplaceProvider }, orderBy: { createdAt: "asc" } }) : Promise.resolve([]),
    marketplaceProvider ? db.marketplaceImport.findMany({ where: { organisationId: ctx.org.id, provider: marketplaceProvider }, orderBy: { createdAt: "desc" }, take: 8 }) : Promise.resolve([]),
    marketplaceProvider ? db.marketplaceEarning.findMany({ where: { organisationId: ctx.org.id, provider: marketplaceProvider }, orderBy: { createdAt: "desc" }, take: 8 }) : Promise.resolve([]),
    db.integration.findFirst({ where: { organisationId: ctx.org.id, provider: definition.provider } }),
    definition.provider === "webhook" ? db.webhookEndpoint.findMany({ where: { organisationId: ctx.org.id }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
    definition.provider === "webhook" ? db.webhookDelivery.findMany({ where: { endpoint: { organisationId: ctx.org.id } }, include: { endpoint: { select: { description: true, url: true } } }, orderBy: { createdAt: "desc" }, take: 20 }) : Promise.resolve([]),
  ]);
  const stripeConnected = definition.provider === "stripe" && Boolean(org?.stripeConnectComplete);
  const connection = connections[0];
  const runtimeStatus = stripeConnected ? "connected" : connection?.status ?? legacyConnection?.status;
  const inboundAddress = connection?.inboundTokenHash ? inboundAddressForConnection(connection.id) : null;
  const forwardingAvailable = Boolean(process.env.INBOUND_EMAIL_DOMAIN && process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET);
  const canAdmin = ctx.role === "owner" || ctx.role === "admin";

  return (
    <div className="min-h-full bg-workbench">
      <header className="border-b border-border bg-background px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/settings/integrations" className="mb-4 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">← Plugins & integrations</Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <IntegrationLogo integration={definition} className="size-14 p-2.5" />
            <div><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{definition.name}</h1><p className="mt-0.5 text-[13px] text-muted-foreground">{CATEGORY_LABELS[definition.category]} · {definition.description}</p></div>
          </div>
          <Status runtime={runtimeStatus} availability={definition.availability} />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-6 p-4 sm:p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
        <div className="space-y-6">
          {query.error && marketplaceProvider ? <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-[13px] text-danger">The import could not be created. Check the file and required fields, then try again.</div> : null}
          {query.connected ? <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-[13px] text-success">Stripe is connected.</div> : null}
          {query.created ? <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-[13px] text-success">Webhook endpoint created. Copy its signing secret before configuring your receiver.</div> : null}
          {query.tested ? <div className="rounded-lg border border-border bg-surface px-4 py-3 text-[13px]">Test delivery completed. Its result appears in delivery history.</div> : null}

          {marketplaceProvider ? (
            <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
              <div className="text-base font-semibold">Import a CSV</div>
              <p className="mt-1 text-[13px] text-muted-foreground">Map the columns from your export. Every row is staged for review before anything changes in ClientFold.</p>
              <div className="mt-5"><CsvImportForm provider={marketplaceProvider} /></div>
            </section>
          ) : null}

          {marketplaceProvider ? (
            <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
              <div className="text-base font-semibold">Add project metadata manually</div>
              <p className="mt-1 text-[13px] text-muted-foreground">Useful when a marketplace has no export or supported API.</p>
              <form action={createManualMarketplaceImportAction} className="mt-5 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="provider" value={marketplaceProvider} />
                <Field name="title" label="Project or order title" required />
                <Field name="externalId" label="Order / project ID" />
                <Field name="buyerHandle" label="Buyer handle" />
                <Field name="buyerName" label="Buyer display name" />
                <Field name="status" label="Marketplace status" />
                <Field name="dueAt" label="Due date" type="date" />
                <Field name="amount" label="Gross amount" inputMode="decimal" />
                <label className="space-y-1"><span className="text-xs font-medium">Currency</span><select name="currency" defaultValue={ctx.org.currency} className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px]"><option>GBP</option><option>USD</option><option>EUR</option></select></label>
                <div className="sm:col-span-2"><Field name="externalUrl" label="Marketplace URL" type="url" /></div>
                <div className="sm:col-span-2"><Button size="sm">Create review item</Button></div>
              </form>
            </section>
          ) : null}

          {marketplaceProvider === "fiverr" ? (
            <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
              <div className="flex items-start justify-between gap-4"><div><div className="text-base font-semibold">Forward order notifications</div><p className="mt-1 text-[13px] text-muted-foreground">Forward Fiverr notification emails to a private ClientFold address. Only normalized metadata is retained.</p></div>{connection?.status === "connected" ? <Badge tone="success">Enabled</Badge> : null}</div>
              {inboundAddress ? <div className="mt-4 rounded-lg border border-border bg-surface p-3"><div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Forward to</div><div className="mt-1 break-all font-mono text-[13px]">{inboundAddress}</div></div> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {!inboundAddress ? <form action={enableMarketplaceForwardingAction.bind(null, marketplaceProvider)}><Button size="sm" disabled={!forwardingAvailable}>Enable forwarding</Button></form> : null}
                {connection && connection.status !== "disabled" ? <form action={disableMarketplaceConnectionAction.bind(null, connection.id)}><Button size="sm" variant="outline">Disable</Button></form> : null}
              </div>
              {!forwardingAvailable ? <p className="mt-3 text-2xs text-muted-foreground">Configure Resend inbound, `INBOUND_EMAIL_DOMAIN`, and `RESEND_WEBHOOK_SECRET` to enable this option.</p> : null}
            </section>
          ) : null}

          {definition.provider === "stripe" ? (
            <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
              <div className="text-base font-semibold">Invoice payments</div><p className="mt-1 text-[13px] text-muted-foreground">Clients pay ClientFold invoices through your own Stripe account. Marketplace-originated payments remain on their marketplace.</p>
              {stripeConnected ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-[13px] text-success">Connected. Payouts go directly to your Stripe account.</div>
                  <form action={disableStripeIntegrationAction}><Button size="sm" variant="outline">Disable in ClientFold</Button></form>
                </div>
              ) : <form action={connectStripeAction} className="mt-5"><Button size="sm">Connect Stripe</Button></form>}
            </section>
          ) : null}

          {definition.provider === "webhook" ? (
            <>
              <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
                <div className="text-base font-semibold">Add an endpoint</div>
                <p className="mt-1 text-[13px] text-muted-foreground">ClientFold sends sanitized JSON over HTTPS. Private-network URLs and redirects are rejected.</p>
                {query.error ? <p className="mt-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger">{query.error === "url" ? "The endpoint must resolve to a public HTTPS address." : "Enter an endpoint and select at least one event."}</p> : null}
                {canAdmin ? <form action={createWebhookEndpointAction} className="mt-5 space-y-4">
                  <Field name="url" label="Endpoint URL" type="url" placeholder="https://example.com/webhooks/clientfold" required />
                  <Field name="description" label="Description" placeholder="Production automation" />
                  <fieldset><legend className="text-xs font-medium">Events</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{WEBHOOK_EVENTS.map((event) => <label key={event} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[11px]"><input type="checkbox" name="events" value={event} className="size-3.5 accent-foreground" />{event}</label>)}</div></fieldset>
                  <Button size="sm">Create endpoint</Button>
                </form> : <p className="mt-4 text-xs text-muted-foreground">An owner or administrator can configure webhook endpoints.</p>}
              </section>

              <section className="space-y-3">
                <div><div className="text-base font-semibold">Endpoints</div><p className="mt-1 text-[13px] text-muted-foreground">Signing uses the raw request body with the timestamp header.</p></div>
                {webhookEndpoints.length ? webhookEndpoints.map((endpoint) => {
                  const secret = canAdmin ? deriveWebhookSecret(endpoint.id, endpoint.secretVersion) : null;
                  return <div key={endpoint.id} className="rounded-xl border border-border bg-background p-5 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="text-sm font-semibold">{endpoint.description || "Webhook endpoint"}</div><div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{endpoint.url}</div></div><Badge tone={endpoint.status === "active" ? "success" : "neutral"}>{endpoint.status}</Badge></div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-md border border-border bg-surface p-3"><div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Subscribed events</div><div className="mt-1 text-xs">{parseWebhookEvents(endpoint.events).length} selected</div></div><div className="rounded-md border border-border bg-surface p-3"><div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Health</div><div className="mt-1 text-xs">{endpoint.lastDeliveredAt ? `Last delivered ${relativeTime(endpoint.lastDeliveredAt)}` : "No successful deliveries yet"}{endpoint.failureCount ? ` · ${endpoint.failureCount} failed attempt${endpoint.failureCount === 1 ? "" : "s"}` : ""}</div></div></div>
                    {secret ? <div className="mt-3 rounded-md border border-warning/25 bg-warning/[0.06] p-3"><div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Signing secret</div><code className="mt-1 block select-all break-all text-[11px]">{secret}</code></div> : null}
                    {canAdmin ? <div className="mt-4 flex flex-wrap gap-2"><form action={sendWebhookTestAction.bind(null, endpoint.id)}><Button size="sm">Send test</Button></form><form action={rotateWebhookSecretAction.bind(null, endpoint.id)}><Button size="sm" variant="outline">Rotate secret</Button></form><form action={setWebhookEndpointStatusAction.bind(null, endpoint.id, endpoint.status !== "active")}><Button size="sm" variant="outline">{endpoint.status === "active" ? "Disable" : "Enable"}</Button></form></div> : null}
                  </div>;
                }) : <div className="rounded-xl border border-dashed border-border bg-background px-5 py-10 text-center text-[13px] text-muted-foreground">No webhook endpoints configured.</div>}
              </section>

              <section className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
                <div className="border-b border-border px-5 py-4"><div className="text-base font-semibold">Delivery history</div><p className="mt-1 text-[13px] text-muted-foreground">The latest 20 attempts across this workspace.</p></div>
                {webhookDeliveries.length ? <div className="divide-y divide-border">{webhookDeliveries.map((delivery) => <div key={delivery.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] font-medium">{delivery.eventType}</span><Badge tone={delivery.status === "delivered" ? "success" : delivery.status === "failed" ? "danger" : "neutral"}>{delivery.status}</Badge></div><div className="mt-1 truncate text-2xs text-muted-foreground">{delivery.endpoint.description || delivery.endpoint.url} · {relativeTime(delivery.createdAt)} · attempt {delivery.attemptCount}</div>{delivery.responseSnippet ? <div className="mt-1 truncate text-2xs text-muted-foreground">{delivery.responseStatus ? `HTTP ${delivery.responseStatus} · ` : ""}{delivery.responseSnippet}</div> : null}</div>{canAdmin && delivery.status === "failed" ? <form action={retryWebhookDeliveryAction.bind(null, delivery.id)}><Button size="sm" variant="outline">Retry now</Button></form> : null}</div>)}</div> : <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">No deliveries yet.</div>}
              </section>
            </>
          ) : null}

          {!marketplaceProvider && definition.provider !== "stripe" && definition.provider !== "webhook" ? (
            legacyConnection?.status === "connected" ? (
              <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
                <div className="text-base font-semibold">Connection health</div>
                <div className="mt-4 rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-[13px] text-success">Connected and ready.</div>
                <form action={disableLegacyIntegrationAction.bind(null, definition.provider)} className="mt-4"><Button size="sm" variant="outline">Disable integration</Button></form>
              </section>
            ) : <section className="rounded-xl border border-dashed border-border bg-background px-5 py-14 text-center"><div className="text-sm font-medium">This integration is not available yet.</div><p className="mx-auto mt-1 max-w-lg text-[13px] text-muted-foreground">The catalogue documents the intended permissions and keeps the setup surface ready without claiming a connection that does not exist.</p></section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <InfoList title="What it does" items={definition.does} tone="success" />
          <InfoList title="Information it reads" items={definition.reads} />
          <InfoList title="What it never does" items={definition.never} tone="danger" />
          {definition.policyNote ? <div className="rounded-xl border border-warning/25 bg-warning/[0.06] p-4"><div className="text-xs font-semibold text-warning">Marketplace boundary</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{definition.policyNote}</p></div> : null}
          {recentImports.length ? <section className="rounded-xl border border-border bg-background p-4 shadow-xs"><div className="text-xs font-semibold">Recent imports</div><div className="mt-3 space-y-2">{recentImports.map((item) => <Link key={item.id} href={`/settings/integrations/imports/${item.id}`} className="block rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface"><div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-medium">{item.sourceName ?? item.sourceType}</span><Badge tone={item.status === "completed" ? "success" : item.status === "failed" ? "danger" : "neutral"}>{item.status.replaceAll("_", " ")}</Badge></div><div className="mt-1 text-2xs text-muted-foreground">{item.itemCount} item{item.itemCount === 1 ? "" : "s"} · {relativeTime(item.createdAt)}</div></Link>)}</div></section> : null}
          {recentEarnings.length ? (
            <section className="rounded-xl border border-border bg-background p-4 shadow-xs">
              <div className="text-xs font-semibold">Marketplace earnings</div>
              <p className="mt-1 text-2xs text-muted-foreground">Kept separate from ClientFold invoices.</p>
              <div className="mt-3 space-y-2">
                {recentEarnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-2xs text-muted-foreground">{earning.externalTransactionId}</div>
                      <div className="text-2xs text-muted-foreground">{earning.occurredAt ? formatDate(earning.occurredAt, { day: "numeric", month: "short", year: "numeric" }) : "Date not supplied"}</div>
                    </div>
                    <div className="text-xs font-semibold">{formatMoney(earning.netAmount ?? earning.grossAmount ?? 0, earning.currency)}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {connection ? <section className="rounded-xl border border-border bg-background p-4 shadow-xs"><div className="text-xs font-semibold">Connection</div><dl className="mt-3 space-y-2 text-xs"><Row label="Created" value={formatDate(connection.createdAt, { day: "numeric", month: "short", year: "numeric" })} /><Row label="Last import" value={connection.lastImportedAt ? relativeTime(connection.lastImportedAt) : "Never"} /></dl></section> : null}
          {legacyConnection ? <section className="rounded-xl border border-border bg-background p-4 shadow-xs"><div className="text-xs font-semibold">Connection history</div><dl className="mt-3 space-y-2 text-xs"><Row label="Status" value={legacyConnection.status} /><Row label="Connected" value={legacyConnection.connectedAt ? formatDate(legacyConnection.connectedAt, { day: "numeric", month: "short", year: "numeric" }) : "Never"} /></dl></section> : null}
          <ButtonLink href="/settings/integrations" variant="outline" size="sm" className="w-full">Back to catalogue</ButtonLink>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="space-y-1"><span className="text-xs font-medium">{label}</span><input {...props} className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring" /></label>;
}
function InfoList({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "success" | "danger" }) {
  const dot = tone === "success" ? "bg-success" : tone === "danger" ? "bg-danger" : "bg-muted-foreground";
  return <section className="rounded-xl border border-border bg-background p-4 shadow-xs"><div className="text-xs font-semibold">{title}</div><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className={`mt-2 size-1.5 shrink-0 rounded-full ${dot}`} />{item}</li>)}</ul></section>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
