import { PortalFrame } from "@/components/portal/portal-frame";
import { MessageList } from "@/components/portal/message-list";
import { DEMO_PORTAL_PROJECT, DEMO_PORTAL_CLIENT } from "@/lib/demo/portal";

export const metadata = { title: "Messages · Client portal demo" };

export default function DemoPortalMessages() {
  return (
    <PortalFrame
      project={DEMO_PORTAL_PROJECT}
      brand={DEMO_PORTAL_CLIENT.brand}
      clientName={DEMO_PORTAL_CLIENT.name}
      basePath="/demo/portal"
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Messages</h1>
      <MessageList messages={DEMO_PORTAL_PROJECT.messages} viewerName={DEMO_PORTAL_CLIENT.name} viewerType="client" />
    </PortalFrame>
  );
}
