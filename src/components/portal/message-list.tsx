import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortalMessage } from "@/lib/portal-view";

/**
 * Renders a conversation from a given viewpoint. `viewerType` decides which
 * bubbles are "mine" (right-aligned) — "client" in the portal, "user" in the
 * agency inbox. System events render as centred meta lines.
 */
export function MessageList({
  messages,
  viewerName,
  viewerType = "client",
}: {
  messages: PortalMessage[];
  viewerName: string;
  viewerType?: "client" | "user";
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center">
        <p className="text-sm font-medium">No messages yet.</p>
        <p className="mt-1 text-2xs text-muted-foreground">Say hello to start the conversation.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {messages.map((m) => {
        if (m.authorType === "system") {
          return (
            <div key={m.id} className="text-center text-2xs text-muted-foreground">
              {m.body}
            </div>
          );
        }
        const mine = m.authorType === viewerType;
        return (
          <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3.5 py-2",
                mine ? "bg-accent text-accent-foreground" : "border border-border bg-surface",
              )}
            >
              <div className="whitespace-pre-wrap text-[13px]">{m.body}</div>
              <div className={cn("mt-1 text-[10px]", mine ? "text-accent-foreground/70" : "text-muted-foreground")}>
                {mine ? viewerName : m.authorName} · {relativeTime(m.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
