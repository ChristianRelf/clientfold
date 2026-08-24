"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SupportArticle } from "@/lib/support/articles";

export function SupportSearch({ articles }: { articles: SupportArticle[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter((article) => `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(needle));
  }, [articles, query]);

  return (
    <div>
      <label htmlFor="support-search" className="sr-only">Search support articles</label>
      <div className="relative max-w-3xl">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7d8078]" aria-hidden>⌕</span>
        <input id="support-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search setup, clients, approvals, billing…" className="h-14 w-full border border-[#c9c8c1] bg-[#fbfaf6] pl-12 pr-5 text-sm outline-none transition-colors placeholder:text-[#9a9c94] focus:border-[#697363] focus:ring-1 focus:ring-[#697363]" />
      </div>
      <p className="mt-4 text-[10px] text-[#85877f]" aria-live="polite">{results.length} {results.length === 1 ? "article" : "articles"}</p>
      <div className="mt-6 grid border-l border-t border-[#d5d4cd] md:grid-cols-2">
        {results.map((article, index) => (
          <Link key={article.slug} href={`/support/${article.slug}`} className="group min-h-48 border-b border-r border-[#d5d4cd] p-5 transition-colors hover:bg-[#efeee8]">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.11em] text-[#8c8e86]"><span>{article.category}</span><span>{article.readTime}</span></div>
            <h3 className="mt-10 text-lg font-medium tracking-[-0.025em] text-[#34372f] group-hover:text-[#4f5b49]">{article.title}</h3>
            <p className="mt-3 max-w-lg text-[11px] leading-5 text-[#777970]">{article.summary}</p>
            <span className="mt-5 inline-block text-[10px] font-medium text-[#5a6654] transition-transform group-hover:translate-x-1" aria-hidden>Read article →</span>
          </Link>
        ))}
      </div>
      {!results.length ? <div className="border-b border-[#d5d4cd] py-12 text-sm text-[#70736a]">No exact match. Try a shorter phrase or <Link href="/contact?topic=support" className="underline underline-offset-4">ask support</Link>.</div> : null}
    </div>
  );
}
