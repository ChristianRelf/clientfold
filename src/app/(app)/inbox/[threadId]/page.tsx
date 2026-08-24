import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { MessageList } from "@/components/portal/message-list";
import { MessageComposer } from "@/components/messaging/message-composer";
import { markThreadRead, viewerKey } from "@/lib/message-reads";
import { sendAgencyMessageAction } from "../actions";
import { parseAttachmentIds } from "@/lib/message-attachments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conversation" };

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const ctx = await getAppContext();

  // Tenant-scoped: thread must belong to the current org, else 404.
  const thread = await db.messageThread.findFirst({
    where: { id: threadId, organisationId: ctx.org.id },
    include: {
      project: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();

  // Opening the thread marks it read for this staff member (clears the badge).
  await markThreadRead(thread.id, viewerKey("user", ctx.user.id));

  const attachmentIds = thread.messages.flatMap((message) => parseAttachmentIds(message.attachments));
  const [attachmentFiles, members] = await Promise.all([
    attachmentIds.length ? db.file.findMany({ where: { id: { in: attachmentIds }, organisationId: ctx.org.id }, select: { id: true, name: true, mimeType: true, size: true } }) : [],
    db.organisationMember.findMany({ where: { organisationId: ctx.org.id, userId: { not: ctx.user.id } }, include: { user: { select: { name: true, email: true } } } }),
  ]);
  const attachmentsById = new Map(attachmentFiles.map((file) => [file.id, file]));

  const messages = thread.messages.map((m) => ({
    id: m.id,
    body: m.body,
    authorName: m.authorName,
    authorType: m.authorType,
    createdAt: m.createdAt.toISOString(),
    attachments: parseAttachmentIds(m.attachments).flatMap((id) => { const file = attachmentsById.get(id); return file ? [file] : []; }),
  }));

  // Bind the threadId into the server action so the composer stays generic.
  const send = sendAgencyMessageAction.bind(null, thread.id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Link href="/inbox" className="text-muted-foreground hover:text-foreground" aria-label="Back to inbox">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <div className="text-sm font-semibold">{thread.project?.name ?? thread.subject ?? "Conversation"}</div>
          <div className="text-2xs text-muted-foreground">{thread.messages.length} messages</div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <MessageList messages={messages} viewerName={ctx.user.name ?? "You"} viewerType="user" attachmentBase="/api/app/files" />
      </div>

      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-2xl">
          <MessageComposer action={send} placeholder="Reply to your client…" mentionables={members.map((member) => ({ id: member.userId, label: member.user.name ?? member.user.email.split("@")[0] }))} />
        </div>
      </div>
    </div>
  );
}
