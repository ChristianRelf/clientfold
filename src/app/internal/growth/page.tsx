import { getFunnel, getAcquisitionBySource, getRevenueSummary } from "@/lib/queries/growth";

export const metadata = { title: "Growth" };
export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  const [funnel, sources, revenue] = await Promise.all([
    getFunnel(),
    getAcquisitionBySource(),
    getRevenueSummary(),
  ]);

  const top = funnel[0]?.count || 1;

  return (
    <div className="container py-8">
      <h1 className="text-xl font-semibold tracking-tight">Growth</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Real first-party events and org state. Figures are exact counts, not estimates.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Funnel */}
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Conversion funnel
          </h2>
          <div className="space-y-1.5">
            {funnel.map((stage) => {
              const pct = Math.round((stage.count / top) * 100);
              return (
                <div key={stage.key} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.label}</span>
                    <span className="font-mono tabular-nums">{stage.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-8">
          {/* Acquisition by source */}
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Acquisition by source
            </h2>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-[13px]">
                <thead className="bg-surface text-2xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Source</th>
                    <th className="px-3 py-2 text-right">Visitors</th>
                    <th className="px-3 py-2 text-right">Signups</th>
                    <th className="px-3 py-2 text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        No traffic recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sources.map((s) => (
                      <tr key={s.source} className="border-t border-border">
                        <td className="px-3 py-2">{s.source}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{s.visitors}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{s.signups}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {s.visitors ? `${Math.round((s.signups / s.visitors) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Revenue */}
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Revenue attribution
            </h2>
            <div className="rounded-md border border-border p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Paid organisations</span>
                <span className="text-lg font-semibold tabular-nums">{revenue.paidCount}</span>
              </div>
              <div className="mt-2 space-y-1">
                {revenue.bySource.map((r) => (
                  <div key={r.source} className="flex justify-between text-[13px] text-muted-foreground">
                    <span>{r.source}</span>
                    <span className="tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
