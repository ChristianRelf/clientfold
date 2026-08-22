import Link from "next/link";
import { attentionItems, type PortalProjectView } from "@/lib/portal-view";

/** The client's first screen: what needs them, progress, and what's next. */
export function PortalOverview({ project, basePath = "/portal" }: { project: PortalProjectView; basePath?: string }) {
  const attention = attentionItems(project);
  const done = project.milestones.filter((m) => m.status === "complete").length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>

      {attention.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium">
            {attention.length} thing{attention.length === 1 ? "" : "s"} need your attention
          </h2>
          <div className="mt-2 space-y-2">
            {attention.map((a) => (
              <Link
                key={a.id}
                href={a.href.replace("/portal", basePath)}
                className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 transition-colors hover:bg-accent/10"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="text-2xs text-muted-foreground">{a.detail}</div>
                </div>
                <span className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-2xs font-medium text-background">
                  {a.kind === "approval" ? "Review" : "Upload"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-surface px-4 py-6 text-center">
          <p className="text-sm font-medium">Nothing needs you right now.</p>
          <p className="mt-1 text-2xs text-muted-foreground">We&apos;ll let you know when something does.</p>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between text-2xs text-muted-foreground">
          <span className="uppercase tracking-wide">Progress</span>
          <span>
            {done} of {project.milestones.length} milestones complete
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </section>

      {project.nextNote ? (
        <section className="rounded-lg bg-surface px-4 py-3">
          <div className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Next</div>
          <p className="mt-0.5 text-[13px]">{project.nextNote}</p>
        </section>
      ) : null}
    </div>
  );
}
