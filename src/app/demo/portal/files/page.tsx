import { PortalFrame } from "@/components/portal/portal-frame";
import { FileRequests } from "@/components/portal/file-requests";
import { DEMO_PORTAL_PROJECT, DEMO_PORTAL_CLIENT } from "@/lib/demo/portal";

export const metadata = { title: "Files · Client portal demo" };

export default function DemoPortalFiles() {
  return (
    <PortalFrame
      project={DEMO_PORTAL_PROJECT}
      brand={DEMO_PORTAL_CLIENT.brand}
      clientName={DEMO_PORTAL_CLIENT.name}
      basePath="/demo/portal"
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Files</h1>
      <FileRequests requests={DEMO_PORTAL_PROJECT.fileRequests} demo />
    </PortalFrame>
  );
}
