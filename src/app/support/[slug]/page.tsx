import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { getSupportArticle, supportArticles } from "@/lib/support/articles";

export function generateStaticParams() {
  return supportArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getSupportArticle((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.summary, alternates: { canonical: `/support/${article.slug}` } };
}

export default async function SupportArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getSupportArticle((await params).slug);
  if (!article) notFound();
  const related = supportArticles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <header className="border-b border-[#d9d8d2] bg-[#f3f2ed]"><div className="container py-12 sm:py-18"><Link href="/support" className="text-[10px] font-medium text-[#626c5d] hover:underline">← Support centre</Link><div className="mt-10 grid gap-10 lg:grid-cols-[1fr_250px] lg:items-end"><div><p className="text-[9px] uppercase tracking-[0.14em] text-[#7d8078]">{article.category} · {article.readTime}</p><h1 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">{article.title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-[#70736a]">{article.summary}</p></div><p className="border-l border-[#d0cfc8] pl-5 text-[11px] leading-5 text-[#7b7d75]">Updated 24 August 2026<br />Applies to the current early-access product.</p></div></div></header>
        <div className="container grid gap-12 py-12 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-20 lg:py-16">
          <aside><nav className="lg:sticky lg:top-24" aria-label="On this page"><p className="text-[9px] uppercase tracking-[0.15em] text-[#8a8c83]">On this page</p><ol className="mt-4 space-y-2">{article.sections.map((section, index) => <li key={section.title}><Link href={`#section-${index + 1}`} className="grid grid-cols-[28px_1fr] text-[11px] leading-5 text-[#777970] hover:text-[#34372f]"><span className="font-mono text-[9px] text-[#a0a198]">0{index + 1}</span><span>{section.title}</span></Link></li>)}</ol></nav></aside>
          <article className="border-t border-[#d8d7d0]">
            {article.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title} className="scroll-mt-28 border-b border-[#d8d7d0] py-9 sm:py-11"><div className="grid gap-5 sm:grid-cols-[44px_1fr]"><span className="font-mono text-[9px] text-[#9a9b94]">0{index + 1}</span><div className="max-w-3xl"><h2 className="text-2xl font-medium tracking-[-0.03em]">{section.title}</h2><div className="mt-5 space-y-3 text-sm leading-7 text-[#62655d]">{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{section.steps ? <ol className="mt-6 border-t border-[#ddddd6]">{section.steps.map((step, stepIndex) => <li key={step} className="grid grid-cols-[34px_1fr] border-b border-[#ddddd6] py-3 text-[13px] leading-6 text-[#5e6159]"><span className="font-mono text-[9px] text-[#94968e]">{String(stepIndex + 1).padStart(2, "0")}</span><span>{step}</span></li>)}</ol> : null}{section.note ? <div className="mt-6 border-l-2 border-[#697363] bg-[#efeee8] p-4 text-[12px] leading-6 text-[#53574e]"><strong className="font-medium">Good to know: </strong>{section.note}</div> : null}</div></div></section>)}
            <div className="mt-8 flex flex-col justify-between gap-4 border border-[#d6d5ce] bg-[#f1f0ea] p-6 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Did this leave a question?</p><p className="mt-1 text-[11px] text-[#777970]">Support can help you work through the exact situation.</p></div><Link href="/contact?topic=support" className="inline-flex h-9 items-center bg-[#30342d] px-4 text-[10px] font-medium text-white">Contact support</Link></div>
          </article>
        </div>
        {related.length ? <section className="border-t border-[#d9d8d2] bg-[#eeede7]"><div className="container py-12"><p className="text-[9px] uppercase tracking-[0.15em] text-[#8a8c83]">Related in {article.category}</p><div className="mt-5 grid border-l border-t border-[#d0cfc8] sm:grid-cols-2">{related.map((item) => <Link key={item.slug} href={`/support/${item.slug}`} className="border-b border-r border-[#d0cfc8] p-5 hover:bg-[#f3f2ed]"><h2 className="text-sm font-medium">{item.title}</h2><p className="mt-2 text-[11px] leading-5 text-[#777970]">{item.summary}</p></Link>)}</div></div></section> : null}
      </main>
      <SiteFooter />
    </div>
  );
}
