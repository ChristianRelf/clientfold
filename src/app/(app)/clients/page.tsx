import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials, relativeTime } from "@/lib/format";

export const metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const ctx = await getAppContext();
  const clients = await db.client.findMany({
    where: { organisationId: ctx.org.id },
    include: { projectLinks: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        actions={<ButtonLink href="/clients/new" size="sm">Invite client</ButtonLink>}
      />
      <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          {clients.length === 0 ? (
            <div className="px-4 py-16 text-center text-[13px] text-muted-foreground">No clients yet.</div>
          ) : (
            clients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 hairline">
                <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {initials(c.company ?? c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.company ?? c.name}</div>
                  <div className="truncate text-2xs text-muted-foreground">{c.email ?? "Marketplace-only client"}</div>
                </div>
                <div className="hidden text-2xs text-muted-foreground sm:block">
                  {c.projectLinks.length} project{c.projectLinks.length === 1 ? "" : "s"}
                </div>
                <Badge tone={c.status === "active" ? "success" : "neutral"}>{c.status}</Badge>
                <div className="hidden w-24 text-right text-2xs text-muted-foreground sm:block">
                  {c.lastActiveAt ? relativeTime(c.lastActiveAt) : "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
