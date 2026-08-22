import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CASE_STUDIES, getCaseStudy } from "@/lib/marketing/customers";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return {};
  return { title: `${c.customer} · Customer story`, description: c.summary };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  return (
    <div className="min-h-screen">
      <SiteNav />
      <article className="container max-w-2xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{c.customer}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{c.summary}</p>

        {c.metrics && c.metrics.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {c.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-4">
                <div className="text-2xs uppercase tracking-wide text-muted-foreground">{m.label}</div>
                <div className="mt-1 text-lg font-semibold">
                  {m.before} → {m.after}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <Section title="The problem" body={c.problem} />
        <Section title="Before ClientFold" body={c.previousWorkflow} />
        <Section title="With ClientFold" body={c.clientfoldWorkflow} />
        <Section title="The result" body={c.result} />

        {c.quote ? (
          <blockquote className="mt-10 border-l-2 border-accent pl-4">
            <p className="text-lg">“{c.quote.text}”</p>
            <footer className="mt-2 text-[13px] text-muted-foreground">
              {c.quote.author}, {c.quote.role}
            </footer>
          </blockquote>
        ) : null}
      </article>
      <SiteFooter />
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      <p className="mt-2 leading-relaxed">{body}</p>
    </section>
  );
}
