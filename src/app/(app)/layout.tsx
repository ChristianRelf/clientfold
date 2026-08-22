import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { inboxUnreadForUser } from "@/lib/message-reads";
import { AppShell } from "@/components/app/app-shell";

export const metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();

  const [waitingCount, inboxUnread] = await Promise.all([
    db.waitingItem.count({ where: { organisationId: ctx.org.id, status: "waiting" } }),
    inboxUnreadForUser(ctx.org.id, ctx.user.id),
  ]);

  return (
    <div
      style={{ ["--accent" as string]: ctx.org.accentColor }}
    >
      <AppShell
        org={ctx.org}
        user={ctx.user}
        waitingCount={waitingCount}
        inboxUnread={inboxUnread}
      >
        {children}
      </AppShell>
    </div>
  );
}
