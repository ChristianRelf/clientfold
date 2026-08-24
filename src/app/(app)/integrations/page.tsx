import { PageHeader } from "@/components/app/page-header";
import { IntegrationCatalogue } from "@/components/integrations/integration-catalogue";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import type { IntegrationProvider } from "@/lib/integrations/registry";

export const metadata = { title: "Plugins & integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const ctx = await getAppContext();
  const [org, legacy, marketplace] = await Promise.all([
    db.organisation.findUnique({ where: { id: ctx.org.id }, select: { stripeConnectComplete: true } }),
    db.integration.findMany({ where: { organisationId: ctx.org.id }, select: { provider: true, status: true } }),
    db.marketplaceConnection.findMany({ where: { organisationId: ctx.org.id }, select: { provider: true, status: true } }),
  ]);
  const statuses: Partial<Record<IntegrationProvider, "connected" | "error" | "disabled">> = {};
  if (org?.stripeConnectComplete) statuses.stripe = "connected";
  for (const item of [...legacy, ...marketplace]) {
    if (item.status === "connected" || item.status === "error" || item.status === "disabled") statuses[item.provider as IntegrationProvider] = item.status;
    if (item.status === "disconnected") statuses[item.provider as IntegrationProvider] = "disabled";
  }

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader title="Plugins & integrations" description="Bring your marketplace work and everyday tools into ClientFold." />
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <IntegrationCatalogue statuses={statuses} />
        <p className="mx-auto mt-10 max-w-3xl text-center text-2xs leading-5 text-muted-foreground">Product names, logos and brands belong to their respective owners. Their appearance here identifies compatibility and does not imply affiliation with or endorsement of ClientFold.</p>
      </div>
    </div>
  );
}
