import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ProjectPortfolio } from "@/components/app/project-portfolio";
import { formatDate } from "@/lib/format";
import type { Health } from "@/lib/health";

export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const ctx = await getAppContext();
  const projects = await db.project.findMany({
    where: { organisationId: ctx.org.id },
    include: { clients: { include: { client: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader
        title="Projects"
        description="A live view of progress, deadlines and the work that needs attention."
        actions={<ButtonLink href="/projects/new" size="sm">New project</ButtonLink>}
      />
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background px-4 py-16 text-center">
            <p className="text-sm font-medium">No projects yet.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Create your first project to invite a client.</p>
          </div>
        ) : (
          <ProjectPortfolio projects={projects.map((project) => ({
            id: project.id,
            name: project.name,
            slug: project.slug,
            client: project.clients[0]?.client.company ?? "No client assigned",
            progress: project.progress,
            health: project.health as Health,
            healthReason: project.healthReason,
            target: project.targetDate ? formatDate(project.targetDate, { day: "numeric", month: "short", year: "numeric" }) : null,
          }))} />
        )}
      </div>
    </div>
  );
}
