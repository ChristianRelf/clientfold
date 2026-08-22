import { resolveActivePortal, markPortalOpened } from "@/lib/portal";
import { PortalFrame } from "@/components/portal/portal-frame";
import { PortalOverview } from "@/components/portal/portal-overview";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const { ctx, project } = await resolveActivePortal();
  await markPortalOpened(ctx.client, project.id);

  return (
    <PortalFrame
      project={project}
      brand={ctx.branding.portalName ?? ctx.branding.organisationName}
      clientName={ctx.client.name}
      poweredBy={!ctx.branding.removeBranding}
    >
      <PortalOverview project={project} />
    </PortalFrame>
  );
}
