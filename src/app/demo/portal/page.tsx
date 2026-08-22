import { PortalFrame } from "@/components/portal/portal-frame";
import { PortalOverview } from "@/components/portal/portal-overview";
import { DEMO_PORTAL_PROJECT, DEMO_PORTAL_CLIENT } from "@/lib/demo/portal";

export const metadata = { title: "Client portal demo" };

export default function DemoPortalHome() {
  return (
    <PortalFrame
      project={DEMO_PORTAL_PROJECT}
      brand={DEMO_PORTAL_CLIENT.brand}
      clientName={DEMO_PORTAL_CLIENT.name}
      basePath="/demo/portal"
    >
      <PortalOverview project={DEMO_PORTAL_PROJECT} basePath="/demo/portal" />
    </PortalFrame>
  );
}
