import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";

/**
 * Global search for the ⌘K palette. Tenant-scoped to the current org across the
 * things people actually look for: projects, clients, invoices, approvals.
 * SQLite `contains` is case-sensitive, so we match on a few casings — good
 * enough for a quick-find; swap to Postgres ILIKE / full-text in production.
 */
export const runtime = "nodejs";

export type SearchHit = { type: string; label: string; sublabel?: string; href: string };

function casings(q: string): string[] {
  const lower = q.toLowerCase();
  const title = lower.replace(/\b\w/g, (c) => c.toUpperCase());
  return Array.from(new Set([q, lower, title, q.toUpperCase()]));
}

export async function GET(request: Request) {
  let ctx;
  try {
    ctx = await getAppContext();
  } catch {
    return NextResponse.json({ hits: [] }, { status: 401 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const org = ctx.org.id;
  const variants = casings(q);
  const orText = (field: string) => variants.map((v) => ({ [field]: { contains: v } }));

  const [projects, clients, invoices, approvals] = await Promise.all([
    db.project.findMany({
      where: { organisationId: org, OR: orText("name") },
      select: { name: true, slug: true, status: true },
      take: 5,
    }),
    db.client.findMany({
      where: { organisationId: org, OR: [...orText("name"), ...orText("company"), ...orText("email")] },
      select: { id: true, name: true, company: true },
      take: 5,
    }),
    db.invoice.findMany({
      where: { organisationId: org, OR: orText("number") },
      select: { id: true, number: true, status: true },
      take: 5,
    }),
    db.approval.findMany({
      where: { project: { organisationId: org }, OR: orText("title") },
      select: { id: true, title: true, status: true, project: { select: { slug: true } } },
      take: 5,
    }),
  ]);

  const hits: SearchHit[] = [
    ...projects.map((p) => ({ type: "Project", label: p.name, sublabel: p.status, href: `/projects/${p.slug}` })),
    ...clients.map((c) => ({ type: "Client", label: c.company ?? c.name, sublabel: c.company ? c.name : undefined, href: `/clients` })),
    ...invoices.map((i) => ({ type: "Invoice", label: i.number, sublabel: i.status, href: `/invoices` })),
    ...approvals.map((a) => ({ type: "Approval", label: a.title, sublabel: a.status.replace("_", " "), href: `/projects/${a.project.slug}` })),
  ];

  return NextResponse.json({ hits });
}
