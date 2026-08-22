import { PortalFrame } from "@/components/portal/portal-frame";
import { PortalInvoiceList } from "@/components/portal/invoice-list";
import { DEMO_PORTAL_PROJECT, DEMO_PORTAL_CLIENT } from "@/lib/demo/portal";

export const metadata = { title: "Invoices · Client portal demo" };

export default function DemoPortalInvoices() {
  return (
    <PortalFrame
      project={DEMO_PORTAL_PROJECT}
      brand={DEMO_PORTAL_CLIENT.brand}
      clientName={DEMO_PORTAL_CLIENT.name}
      basePath="/demo/portal"
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Invoices</h1>
      <PortalInvoiceList invoices={DEMO_PORTAL_PROJECT.invoices} demo />
    </PortalFrame>
  );
}
