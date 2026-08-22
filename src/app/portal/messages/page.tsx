import { resolveActivePortal } from "@/lib/portal";
import { PortalFrame } from "@/components/portal/portal-frame";
import { MessageList } from "@/components/portal/message-list";
import { MessageComposer } from "@/components/messaging/message-composer";
import { markProjectThreadsRead, viewerKey } from "@/lib/message-reads";
import { sendPortalMessageAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PortalMessages() {
  const { ctx, project } = await resolveActivePortal();

  // Opening Messages clears the client's unread badge for this project.
  if (project.messagesUnread > 0) {
    await markProjectThreadsRead(project.id, viewerKey("client", ctx.client.id));
  }
  return (
    <PortalFrame
      project={project}
      brand={ctx.branding.portalName ?? ctx.branding.organisationName}
      clientName={ctx.client.name}
      poweredBy={!ctx.branding.removeBranding}
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Messages</h1>
      <MessageList messages={project.messages} viewerName={ctx.client.name} viewerType="client" />
      <div className="mt-4">
        <MessageComposer action={sendPortalMessageAction} placeholder="Message your project team…" />
      </div>
    </PortalFrame>
  );
}
