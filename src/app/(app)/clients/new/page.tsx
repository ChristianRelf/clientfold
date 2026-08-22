import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { NewClientForm } from "@/components/app/new-client-form";

export const metadata = { title: "Invite client" };
export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const ctx = await getAppContext();
  const projects = await db.project.findMany({
    where: { organisationId: ctx.org.id, status: { not: "archived" } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="Invite a client" description="Add a client and send them a secure link to their portal." />
      <div className="max-w-xl p-6">
        <NewClientForm projects={projects.map((p) => ({ id: p.id, label: p.name }))} />
      </div>
    </div>
  );
}
