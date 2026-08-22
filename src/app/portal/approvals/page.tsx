import { resolveActivePortal } from "@/lib/portal";
import { PortalFrame } from "@/components/portal/portal-frame";
import { ApprovalList } from "@/components/portal/approval-list";

export const dynamic = "force-dynamic";

export default async function PortalApprovals() {
  const { ctx, project } = await resolveActivePortal();
  return (
    <PortalFrame
      project={project}
      brand={ctx.branding.portalName ?? ctx.branding.organisationName}
      clientName={ctx.client.name}
      poweredBy={!ctx.branding.removeBranding}
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Approvals</h1>
      <ApprovalList approvals={project.approvals} />
    </PortalFrame>
  );
}
