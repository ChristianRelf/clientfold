import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatMoney, relativeTime } from "@/lib/format";
import { HEALTH_LABEL, type Health } from "@/lib/health";
import { cn } from "@/lib/utils";
import { getIntegration } from "@/lib/integrations/registry";
import { IntegrationLogo } from "@/components/integrations/integration-logo";

export const dynamic = "force-dynamic";

const HEALTH_TONE: Record<Health, Parameters<typeof Badge>[0]["tone"]> = {
  on_track: "success",
  waiting_on_client: "waiting",
  at_risk: "warning",
  overdue: "danger",
};

const VIEWS = ["overview", "tasks", "approvals", "files", "messages", "invoices", "activity"] as const;
type View = (typeof VIEWS)[number];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function ProjectWorkspace({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const ctx = await getAppContext();
  const activeView: View = VIEWS.includes(query.view as View) ? (query.view as View) : "overview";

  const project = await db.project.findFirst({
    where: { slug, organisationId: ctx.org.id },
    include: {
      clients: { include: { client: true } },
      milestones: { orderBy: { order: "asc" } },
      tasks: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] },
      approvals: { include: { versions: { orderBy: { version: "desc" } } }, orderBy: { updatedAt: "desc" } },
      files: { where: { archived: false }, include: { _count: { select: { comments: true } } }, orderBy: { createdAt: "desc" } },
      threads: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 30 },
      waitingItems: { where: { status: "waiting" }, orderBy: { requestedAt: "asc" } },
      marketplaceLinks: { where: { externalType: "project" }, orderBy: { lastImportedAt: "desc" }, take: 1 },
    },
  });
  if (!project) notFound();

  const client = project.clients[0]?.client;
  const currentStage = project.milestones.find((milestone) => milestone.status === "in_progress");
  const blockingApproval = project.approvals.find((approval) => approval.status === "awaiting_approval");
  const blockingWaiting = project.waitingItems[0];
  const marketplaceLink = project.marketplaceLinks[0];
  const marketplaceDefinition = marketplaceLink ? getIntegration(marketplaceLink.provider) : undefined;
  const counts: Record<View, number | null> = {
    overview: null,
    tasks: project.tasks.length,
    approvals: project.approvals.length,
    files: project.files.length,
    messages: project.threads.length,
    invoices: project.invoices.length,
    activity: project.activities.length,
  };

  return (
    <div className="min-h-full bg-workbench">
      <header className="border-b border-border bg-background/80 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/projects" className="mb-2 inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">← Portfolio</Link>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{project.name}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{client?.company ?? client?.name ?? "No client assigned"}</p>
            {marketplaceDefinition ? <div className="mt-3 flex items-center gap-2"><IntegrationLogo integration={marketplaceDefinition} className="size-7 rounded-lg p-1" /><Badge tone="neutral">Managed on {marketplaceDefinition.name}</Badge></div> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {marketplaceLink ? marketplaceLink.externalUrl ? <a href={marketplaceLink.externalUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-[13px] font-medium hover:bg-muted/50">Open on {marketplaceDefinition?.name ?? "marketplace"} ↗</a> : <Badge tone="warning">Marketplace communication only</Badge> : <ButtonLink variant="outline" size="sm" href={project.threads[0] ? `/inbox/${project.threads[0].id}` : "/inbox"}>Message client</ButtonLink>}
            <ButtonLink variant="outline" size="sm" href="/files">Add file</ButtonLink>
            <ButtonLink size="sm" href="/waiting">Waiting room</ButtonLink>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
          <Meta label="Status" value={project.status === "active" ? "In progress" : project.status} />
          <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Health</span><Badge tone={HEALTH_TONE[project.health as Health] ?? "neutral"}>{HEALTH_LABEL[project.health as Health] ?? project.health}</Badge></div>
          <Meta label="Progress" value={`${project.progress}%`} />
          <Meta label="Target" value={project.targetDate ? formatDate(project.targetDate) : "-"} />
        </div>

        <nav className="-mb-5 mt-5 flex gap-1 overflow-x-auto" aria-label="Project views">
          {VIEWS.map((view) => (
            <Link
              key={view}
              href={view === "overview" ? `/projects/${slug}` : `/projects/${slug}?view=${view}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 pb-3 pt-1 text-[13px] capitalize transition-colors",
                activeView === view ? "border-accent font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {view}<span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", activeView === view ? "bg-accent/10 text-accent" : "bg-muted")}>{counts[view]}</span>
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        {activeView === "overview" ? (
          <Overview project={project} currentStage={currentStage} blockingApproval={blockingApproval} blockingWaiting={blockingWaiting} marketplaceName={marketplaceDefinition?.name} marketplaceUrl={marketplaceLink?.externalUrl} />
        ) : activeView === "tasks" ? (
          <ListFrame emptyTitle="No tasks in this project yet." emptyNote="Tasks will appear here as the team builds out the project plan." hasItems={Boolean(project.tasks.length)}>
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3.5 hairline">
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border text-[10px]", task.status === "complete" ? "border-success bg-success text-white" : "border-border")}>{task.status === "complete" ? "✓" : ""}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{task.title}</div><div className="text-2xs capitalize text-muted-foreground">{task.status.replace("_", " ")} · {task.priority} priority</div></div>
                {task.dueDate ? <span className="text-xs text-muted-foreground">{formatDate(task.dueDate, { day: "numeric", month: "short" })}</span> : null}
              </div>
            ))}
          </ListFrame>
        ) : activeView === "approvals" ? (
          <ListFrame emptyTitle="No approvals yet." emptyNote="Approval requests and decision history will live here." hasItems={Boolean(project.approvals.length)}>
            {project.approvals.map((approval) => (
              <div key={approval.id} className="flex items-center gap-4 px-4 py-4 hairline">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">A</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{approval.title}</div><div className="text-2xs text-muted-foreground">{approval.versions.length} version{approval.versions.length === 1 ? "" : "s"}{approval.requestedAt ? ` · requested ${relativeTime(approval.requestedAt)}` : ""}</div></div>
                <Badge tone={approval.status === "approved" ? "success" : approval.status === "awaiting_approval" ? "waiting" : "neutral"}>{approval.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </ListFrame>
        ) : activeView === "files" ? (
          <ListFrame emptyTitle="No project files yet." emptyNote="Upload a file and it will stay attached to this project." hasItems={Boolean(project.files.length)}>
            {project.files.map((file) => (
              <Link key={file.id} href={file.mimeType.startsWith("image/") ? `/files/${file.id}` : `/api/app/files/${file.id}`} className="flex items-center gap-4 px-4 py-4 hairline transition-colors hover:bg-surface/50">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-2xs font-semibold uppercase">{file.name.split(".").pop()?.slice(0, 3)}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{file.name}</div><div className="text-2xs text-muted-foreground">Added {relativeTime(file.createdAt)} · {file._count.comments} comment{file._count.comments === 1 ? "" : "s"}</div></div>
                <span className="text-xs text-muted-foreground">Open →</span>
              </Link>
            ))}
          </ListFrame>
        ) : activeView === "messages" ? (
          <ListFrame emptyTitle="No project conversation yet." emptyNote="Start a client conversation from the project header." hasItems={Boolean(project.threads.length)}>
            {project.threads.map((thread) => (
              <Link key={thread.id} href={`/inbox/${thread.id}`} className="flex items-center gap-4 px-4 py-4 hairline transition-colors hover:bg-surface/50">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs">M</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{thread.subject ?? "Project conversation"}</div><div className="truncate text-2xs text-muted-foreground">{thread.messages[0] ? `${thread.messages[0].authorName}: ${thread.messages[0].body}` : "No messages yet"}</div></div>
                <span className="text-xs text-muted-foreground">{relativeTime(thread.updatedAt)}</span>
              </Link>
            ))}
          </ListFrame>
        ) : activeView === "invoices" ? (
          <ListFrame emptyTitle="No project invoices yet." emptyNote="Invoices linked to this project will appear here." hasItems={Boolean(project.invoices.length)}>
            {project.invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 hairline sm:grid-cols-[1fr_auto_auto]">
                <div><div className="font-mono text-sm font-medium">{invoice.number}</div><div className="text-2xs text-muted-foreground">{invoice.dueDate ? `Due ${formatDate(invoice.dueDate, { day: "numeric", month: "short" })}` : "No due date"}</div></div>
                <Badge tone={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "danger" : "accent"}>{invoice.status.replaceAll("_", " ")}</Badge>
                <span className="col-span-2 text-right font-mono text-sm sm:col-span-1">{formatMoney(invoice.total - invoice.amountPaid, invoice.currency)}</span>
              </div>
            ))}
          </ListFrame>
        ) : (
          <ListFrame emptyTitle="No activity recorded yet." emptyNote="Project changes and client actions will build a durable record here." hasItems={Boolean(project.activities.length)}>
            {project.activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 px-4 py-3.5 hairline"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" /><div className="min-w-0"><div className="text-[13px]">{activity.summary}</div><div className="mt-0.5 text-2xs text-muted-foreground">{relativeTime(activity.createdAt)}</div></div></div>
            ))}
          </ListFrame>
        )}
      </div>
    </div>
  );
}

type ProjectData = NonNullable<Awaited<ReturnType<typeof db.project.findFirst<{
  include: {
    clients: { include: { client: true } };
    milestones: true;
    tasks: true;
    approvals: { include: { versions: true } };
    files: { include: { _count: { select: { comments: true } } } };
    threads: { include: { messages: true } };
    invoices: true;
    activities: true;
    waitingItems: true;
    marketplaceLinks: true;
  };
}>>>>;

function Overview({ project, currentStage, blockingApproval, blockingWaiting, marketplaceName, marketplaceUrl }: { project: ProjectData; currentStage: ProjectData["milestones"][number] | undefined; blockingApproval: ProjectData["approvals"][number] | undefined; blockingWaiting: ProjectData["waitingItems"][number] | undefined; marketplaceName?: string; marketplaceUrl?: string | null }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        {marketplaceName ? <section className="rounded-xl border border-accent/20 bg-accent/[0.045] p-5"><div className="text-2xs font-medium uppercase tracking-[0.12em] text-accent">Marketplace-managed engagement</div><p className="mt-2 text-[13px] leading-5 text-muted-foreground">Communication, delivery, disputes and payment stay on {marketplaceName}. ClientFold keeps an internal metadata view and will not send portal invitations or payment requests for this project.</p>{marketplaceUrl ? <a href={marketplaceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-foreground hover:text-accent">Open source engagement ↗</a> : null}</section> : null}
        <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Current stage</div>
          <div className="mt-2 text-lg font-semibold">{currentStage?.title ?? "No active stage"}</div>
          {currentStage?.description ? <p className="mt-1 text-[13px] text-muted-foreground">{currentStage.description}</p> : <p className="mt-1 text-[13px] text-muted-foreground">The next milestone is ready to be shaped.</p>}
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} /></div>
        </section>

        {blockingApproval || blockingWaiting ? (
          <section className="rounded-xl border border-waiting/30 bg-waiting/[0.055] p-5">
            <div className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.12em] text-waiting"><span className="size-1.5 rounded-full bg-waiting" />Waiting on client</div>
            <div className="mt-2 text-base font-semibold">{blockingApproval?.title ?? blockingWaiting?.title}</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{blockingApproval?.requestedAt ? `Requested ${formatDate(blockingApproval.requestedAt, { day: "numeric", month: "long" })}` : blockingWaiting ? `Requested ${relativeTime(blockingWaiting.requestedAt)}` : null}{blockingApproval?.deadline ? ` · Due ${formatDate(blockingApproval.deadline, { day: "numeric", month: "long" })}` : null}</div>
            <ButtonLink href="/waiting" size="sm" className="mt-4">Review in waiting room</ButtonLink>
          </section>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
        <div className="text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Milestones</div>
        <ol className="mt-4">
          {project.milestones.map((milestone, index) => {
            const done = milestone.status === "complete";
            const active = milestone.status === "in_progress";
            return (
              <li key={milestone.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={done ? "grid size-5 place-items-center rounded-full bg-success text-white" : active ? "grid size-5 place-items-center rounded-full border-2 border-accent bg-background" : "grid size-5 place-items-center rounded-full border-2 border-border bg-background"}>{done ? "✓" : active ? <span className="size-1.5 rounded-full bg-accent" /> : null}</span>
                  {index < project.milestones.length - 1 ? <span className={done ? "w-0.5 flex-1 bg-success/40" : "w-0.5 flex-1 bg-border"} /> : null}
                </div>
                <div className="pb-5"><div className={cn("text-sm", active && "font-medium")}>{milestone.title}</div>{milestone.dueDate ? <div className="text-2xs text-muted-foreground">{done ? "Completed" : "Due"} {formatDate(milestone.completedAt ?? milestone.dueDate, { day: "numeric", month: "short" })}</div> : null}</div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function ListFrame({ children, hasItems, emptyTitle, emptyNote }: { children: React.ReactNode; hasItems: boolean; emptyTitle: string; emptyNote: string }) {
  return hasItems ? <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">{children}</div> : <div className="rounded-xl border border-dashed border-border bg-background px-5 py-16 text-center"><p className="text-sm font-medium">{emptyTitle}</p><p className="mx-auto mt-1 max-w-md text-[13px] text-muted-foreground">{emptyNote}</p></div>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center gap-1.5"><span className="text-muted-foreground">{label}</span><span className="font-medium capitalize">{value}</span></div>;
}
