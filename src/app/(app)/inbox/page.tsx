import Link from "next/link";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { countUnread, viewerKey } from "@/lib/message-reads";

export const metadata = { title: "Inbox" };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const ctx = await getAppContext();
  const me = viewerKey("user", ctx.user.id);
  const threads = await db.messageThread.findMany({
    where: { organisationId: ctx.org.id },
    include: {
      project: true,
      messages: { orderBy: { createdAt: "desc" }, select: { authorName: true, body: true, createdAt: true, readBy: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader title="Inbox" description="Every client conversation across your projects." />
      <div className="mx-auto max-w-[1000px] p-4 sm:p-6 lg:p-8">
        {threads.length === 0 ? (
          <EmptyState title="No messages yet." description="Project conversations with your clients appear here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
            {threads.map((t) => {
              const last = t.messages[0];
              const unread = countUnread(t.messages, me);
              return (
                <Link
                  key={t.id}
                  href={`/inbox/${t.id}`}
                  className="flex items-center gap-3 px-4 py-3 hairline transition-colors hover:bg-muted/40"
                >
                  {unread ? (
                    <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  ) : (
                    <span className="size-2 shrink-0" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>
                      {t.project?.name ?? t.subject ?? "Conversation"}
                    </div>
                    <div className={cn("truncate text-2xs", unread ? "text-foreground" : "text-muted-foreground")}>
                      {last ? `${last.authorName}: ${last.body}` : "No messages"}
                    </div>
                  </div>
                  {unread ? (
                    <span className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 text-2xs font-semibold tabular-nums text-accent">
                      {unread}
                    </span>
                  ) : null}
                  {last ? <span className="hidden shrink-0 text-2xs text-muted-foreground sm:block">{relativeTime(last.createdAt)}</span> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
