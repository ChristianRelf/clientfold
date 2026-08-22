import Link from "next/link";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { getWaitingRoom } from "@/lib/queries/waiting";
import { formatDate, formatMoney, relativeTime } from "@/lib/format";
import { HEALTH_LABEL, type Health } from "@/lib/health";
import { WAITING_TYPE_LABEL, type DemoWaitingItem } from "@/lib/demo/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

const TYPE_ICON: Record<DemoWaitingItem["type"], React.ReactNode> = {
  approval: <Icon path="M5 12.5 9.2 17 19 7" />,
  file_request: <Icon path="M4 7.5h6l2-2h8v13H4v-11Z" />,
  payment: <Icon path="M16.5 8.2c-.7-.8-1.7-1.2-3-1.2-1.8 0-3 1-3 2.4 0 3.6 6.5 1.8 6.5 5.3 0 1.4-1.3 2.4-3.2 2.4-1.5 0-2.8-.5-3.7-1.5M13.5 4.5v15" />,
  task: <Icon path="M5 6h14M5 12h14M5 18h8" />,
  reply: <Icon path="M5 5h14v11H9l-4 3V5Z" />,
};

const TYPE_ACTION: Record<DemoWaitingItem["type"], string> = {
  approval: "Review approval",
  file_request: "Open request",
  payment: "Review invoice",
  task: "Open task",
  reply: "Open conversation",
};

const HEALTH_TONE: Record<Health, string> = {
  on_track: "bg-success",
  waiting_on_client: "bg-waiting",
  at_risk: "bg-warning",
  overdue: "bg-danger",
};

export default async function HomePage() {
  const ctx = await getAppContext();
  const orgId = ctx.org.id;

  const [waiting, projects, activities, invoices] = await Promise.all([
    getWaitingRoom(orgId),
    db.project.findMany({
      where: { organisationId: orgId, status: "active" },
      include: { clients: { include: { client: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.activity.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.invoice.findMany({
      where: { organisationId: orgId },
      select: { status: true, total: true, amountPaid: true },
    }),
  ]);

  const primaryAction = waiting[0];
  const queuedActions = waiting.slice(1, 4);
  const approvals = waiting.filter((item) => item.type === "approval").length;
  const outstanding = invoices
    .filter((invoice) => ["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.total - invoice.amountPaid, 0);
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
    : 0;
  const projectCount = new Set(waiting.map((item) => item.projectSlug).filter(Boolean)).size;
  const firstName = ctx.user.name?.split(" ")[0] ?? "there";
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(new Date());

  return (
    <div className="min-h-full bg-workbench">
      <header className="border-b border-border/70 bg-background/80 px-4 py-5 backdrop-blur sm:px-6 lg:px-10 lg:py-7">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-6">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.19em] text-muted-foreground">{today}</p>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-[1.75rem]">Let&apos;s move work forward, {firstName}.</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/clients/new" className="rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">Add client</Link>
            <Link href="/projects/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow-sm transition-transform hover:-translate-y-px"><span className="text-base leading-none">+</span> New project</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1380px] gap-10 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-10 lg:py-10 xl:gap-16">
        <div className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Your flow</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Start here. The rest follows.</h2>
            </div>
            <Link href="/waiting" className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:block">See all {waiting.length} waiting <span aria-hidden>→</span></Link>
          </div>

          {primaryAction ? (
            <section className="relative overflow-hidden rounded-[1.75rem] bg-foreground text-background shadow-pop" aria-labelledby="primary-action-title">
              <div className="absolute -right-16 -top-20 size-60 rounded-full border border-background/10" />
              <div className="absolute -right-7 -top-10 size-40 rounded-full border border-background/10" />
              <div className="relative grid gap-7 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
                <div className="max-w-2xl">
                  <div className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-background/55">
                    <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-waiting/50" /><span className="relative inline-flex size-2 rounded-full bg-waiting" /></span>
                    Start here · waiting {primaryAction.daysWaiting} day{primaryAction.daysWaiting === 1 ? "" : "s"}
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-xs text-background/60">
                    <span>{primaryAction.clientCompany}</span>
                    {primaryAction.project ? <><span className="text-background/25">/</span><span>{primaryAction.project}</span></> : null}
                  </div>
                  <h3 id="primary-action-title" className="max-w-xl text-2xl font-semibold leading-tight tracking-[-0.045em] sm:text-3xl">{primaryAction.title}</h3>
                  <p className="mt-3 max-w-xl text-[13px] leading-5 text-background/58">This is the oldest open client action. Clear it first to create the most momentum today.</p>
                </div>
                <Link href={primaryAction.href} className="group inline-flex h-12 items-center justify-between gap-7 rounded-full bg-background pl-5 pr-2 text-[13px] font-semibold text-foreground shadow-md transition-transform hover:-translate-y-0.5 md:min-w-44">
                  {TYPE_ACTION[primaryAction.type]}<span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                </Link>
              </div>
              <div className="relative grid grid-cols-3 divide-x divide-background/10 border-t border-background/10 bg-background/[0.045]">
                <FlowMetric value={String(approvals)} label="decisions needed" />
                <FlowMetric value={String(projectCount || projects.length)} label="projects held up" />
                <FlowMetric value={formatMoney(outstanding, ctx.org.currency)} label="still to collect" />
              </div>
            </section>
          ) : (
            <section className="relative overflow-hidden rounded-[1.75rem] bg-foreground p-7 text-background shadow-pop sm:p-9">
              <span className="grid size-11 place-items-center rounded-full bg-success text-white"><Icon path="M5 12.5 9.2 17 19 7" /></span>
              <h3 className="mt-8 text-3xl font-semibold tracking-[-0.045em]">Client work is flowing.</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-background/60">Nothing is waiting on a client. Put that clear runway into the project that matters most.</p>
              <Link href={projects[0] ? `/projects/${projects[0].slug}` : "/projects/new"} className="mt-7 inline-flex items-center gap-3 rounded-full bg-background px-5 py-3 text-[13px] font-semibold text-foreground">{projects[0] ? `Continue ${projects[0].name}` : "Start your first project"} <span aria-hidden>→</span></Link>
            </section>
          )}

          <section className="relative mt-10" aria-labelledby="next-heading">
            <div className="absolute bottom-0 left-[19px] top-9 w-px bg-border" aria-hidden />
            <div className="relative mb-4 flex items-center justify-between gap-4 pl-14">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Up next</p><h2 id="next-heading" className="mt-0.5 text-base font-semibold tracking-tight">Keep the thread moving</h2></div>
              {waiting.length > 4 ? <span className="text-xs text-muted-foreground">+{waiting.length - 4} later</span> : null}
            </div>

            <div className="relative space-y-2">
              {queuedActions.length ? queuedActions.map((item) => (
                <Link key={item.id} href={item.href} className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-transparent py-3 pr-3 transition-all hover:border-border hover:bg-background hover:shadow-xs sm:gap-4 sm:pr-4">
                  <span className="z-10 grid size-10 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-xs transition-colors group-hover:border-accent group-hover:text-accent">{TYPE_ICON[item.type]}</span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{item.title}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.clientCompany}{item.project ? ` · ${item.project}` : ""}</span></span>
                  <span className="flex items-center gap-3">
                    <span className="hidden text-right sm:block"><span className="block text-[11px] font-semibold text-waiting">{item.daysWaiting}d waiting</span><span className="block text-[10px] text-muted-foreground">{WAITING_TYPE_LABEL[item.type]}</span></span>
                    <span className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background" aria-hidden>→</span>
                  </span>
                </Link>
              )) : (
                <div className="relative flex items-center gap-4 py-3"><span className="z-10 grid size-10 place-items-center rounded-full border border-success/30 bg-background text-success"><Icon path="M5 12.5 9.2 17 19 7" /></span><p className="text-[13px] text-muted-foreground">No follow-ups are queued behind your focus item.</p></div>
              )}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="projects-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">In motion</p><h2 id="projects-heading" className="mt-0.5 text-base font-semibold tracking-tight">Where the work goes next</h2></div>
              <Link href="/projects" className="text-xs font-medium text-muted-foreground hover:text-foreground">All projects <span aria-hidden>→</span></Link>
            </div>
            {projects.length ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
                {projects.slice(0, 4).map((project) => {
                  const health = project.health as Health;
                  return (
                    <Link key={project.id} href={`/projects/${project.slug}`} className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 border-b border-border/70 p-4 last:border-0 hover:bg-surface/65 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)_auto] sm:items-center sm:px-5">
                      <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{project.name}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{project.clients[0]?.client.company ?? "No client assigned"}</span></span>
                      <span className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto"><span className="mb-1.5 flex justify-between text-[10px] text-muted-foreground"><span>Progress</span><span className="font-mono">{project.progress}%</span></span><span className="block h-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} /></span></span>
                      <span className="col-start-2 row-start-1 flex items-center justify-end gap-3 sm:col-start-auto sm:row-start-auto"><span className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground min-[430px]:inline-flex sm:inline-flex"><span className={cn("size-1.5 rounded-full", HEALTH_TONE[health] ?? "bg-muted-foreground")} />{HEALTH_LABEL[health] ?? project.health}</span><span className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden>→</span></span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link href="/projects/new" className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-background p-5 text-[13px] hover:border-input"><span><span className="block font-semibold">Build your first flow</span><span className="mt-1 block text-xs text-muted-foreground">Start a project and invite a client.</span></span><span aria-hidden>→</span></Link>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-8 lg:pt-7">
          <section aria-labelledby="pulse-heading">
            <div className="mb-4 flex items-center justify-between"><h2 id="pulse-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Flow check</h2><span className="inline-flex items-center gap-1.5 text-[10px] text-success"><span className="size-1.5 rounded-full bg-success" /> Live</span></div>
            <div className="border-y border-border">
              <RailStat value={`${averageProgress}%`} label="Average project progress" detail={`${projects.length} active`} />
              <RailStat value={String(waiting.length)} label="Client actions waiting" detail={waiting.length ? "Needs attention" : "All clear"} warm={waiting.length > 0} />
              <RailStat value={formatMoney(outstanding, ctx.org.currency)} label="Open invoice balance" detail="Across sent invoices" />
            </div>
          </section>

          <section aria-labelledby="activity-heading">
            <div className="mb-4 flex items-center justify-between"><h2 id="activity-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Just happened</h2><Link href="/inbox" className="text-[10px] font-medium text-muted-foreground hover:text-foreground">Inbox →</Link></div>
            {activities.length ? (
              <ol className="space-y-0">
                {activities.slice(0, 4).map((activity, index) => (
                  <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < Math.min(activities.length, 4) - 1 ? <span className="absolute bottom-0 left-[4px] top-3 w-px bg-border" aria-hidden /> : null}
                    <span className={cn("relative mt-1 size-[9px] shrink-0 rounded-full border-2 border-background", index === 0 ? "bg-accent ring-2 ring-accent/15" : "bg-border")} />
                    <div className="min-w-0"><p className="text-xs leading-[1.15rem]">{activity.summary}</p><p className="mt-1 text-[10px] text-muted-foreground">{relativeTime(activity.createdAt)}</p></div>
                  </li>
                ))}
              </ol>
            ) : <p className="text-xs text-muted-foreground">Movement will appear here as your clients respond.</p>}
          </section>

          <section className="rounded-2xl bg-accent/[0.09] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Next milestone</p>
            {projects.find((project) => project.targetDate) ? (() => {
              const next = [...projects].filter((project) => project.targetDate).sort((a, b) => a.targetDate!.getTime() - b.targetDate!.getTime())[0];
              return <><p className="mt-4 text-lg font-semibold tracking-tight">{formatDate(next.targetDate!, { day: "numeric", month: "long" })}</p><p className="mt-1 truncate text-xs text-muted-foreground">{next.name}</p><Link href={`/projects/${next.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold">View project <span aria-hidden>→</span></Link></>;
            })() : <><p className="mt-4 text-sm font-semibold">No date on the horizon</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Add a target date to an active project to keep the work pointed forward.</p></>}
          </section>
        </aside>
      </main>
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden><path d={path} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function FlowMetric({ value, label }: { value: string; label: string }) {
  return <div className="min-w-0 px-3 py-4 sm:px-7"><span className="block truncate font-mono text-sm font-semibold tracking-tight sm:text-base">{value}</span><span className="mt-0.5 block text-[9px] leading-3 text-background/48 sm:text-[10px]">{label}</span></div>;
}

function RailStat({ value, label, detail, warm = false }: { value: string; label: string; detail: string; warm?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-border py-4 last:border-0">
      <div><p className="text-xs font-medium">{label}</p><p className={cn("mt-1 text-[10px]", warm ? "text-waiting" : "text-muted-foreground")}>{detail}</p></div>
      <p className="font-mono text-xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  );
}
