import { PortalFrame } from "@/components/portal/portal-frame";
import { ApprovalList } from "@/components/portal/approval-list";
import { DEMO_PORTAL_PROJECT, DEMO_PORTAL_CLIENT } from "@/lib/demo/portal";

export const metadata = { title: "Approvals · Client portal demo" };

export default function DemoPortalApprovals() {
  return (
    <PortalFrame
      project={DEMO_PORTAL_PROJECT}
      brand={DEMO_PORTAL_CLIENT.brand}
      clientName={DEMO_PORTAL_CLIENT.name}
      basePath="/demo/portal"
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Approvals</h1>
      <ApprovalList approvals={DEMO_PORTAL_PROJECT.approvals} demo />
    </PortalFrame>
  );
}
