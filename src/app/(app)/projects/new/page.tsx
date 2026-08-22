import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { ProjectWizard } from "@/components/app/project-wizard";

export const metadata = { title: "New project" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const ctx = await getAppContext();
  const clients = await db.client.findMany({
    where: { organisationId: ctx.org.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, company: true, email: true },
  });

  return (
    <div>
      <PageHeader title="New project" description="Set up a project, add milestones, and invite your client." />
      <div className="max-w-2xl p-6">
        <ProjectWizard
          clients={clients.map((c) => ({ id: c.id, label: c.company ?? c.name, email: c.email }))}
        />
      </div>
    </div>
  );
}
