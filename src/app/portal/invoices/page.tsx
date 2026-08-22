import Link from "next/link";
import { resolveActivePortal } from "@/lib/portal";
import { markInvoiceViewed } from "@/lib/invoices";
import { PortalFrame } from "@/components/portal/portal-frame";
import { PortalInvoiceList } from "@/components/portal/invoice-list";

export const dynamic = "force-dynamic";

export default async function PortalInvoices({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const { ctx, project } = await resolveActivePortal();
  const { paid } = await searchParams;

  // Mark unpaid invoices as viewed (invoice.viewed signal for the agency).
  await Promise.all(project.invoices.filter((i) => i.status === "sent").map((i) => markInvoiceViewed(i.id)));

  return (
    <PortalFrame
      project={project}
      brand={ctx.branding.portalName ?? ctx.branding.organisationName}
      clientName={ctx.client.name}
      poweredBy={!ctx.branding.removeBranding}
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Invoices</h1>

      {paid ? (
        <div className="mb-4 animate-scale-in rounded-lg border border-success/30 bg-success/5 p-4 text-center">
          <p className="text-sm font-medium">Payment received. Thank you.</p>
          {!ctx.branding.removeBranding ? (
            <p className="mt-2 text-2xs text-muted-foreground">
              Work with clients yourself?{" "}
              <Link href="/?ref=portal-paid" className="font-medium text-accent hover:underline">
                Create a ClientFold workspace
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <PortalInvoiceList invoices={project.invoices} />
    </PortalFrame>
  );
}
