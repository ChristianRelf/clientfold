import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AUDIENCES } from "@/lib/marketing/content";
import { AudienceLander } from "@/components/marketing/audience-lander";

export function generateStaticParams() {
  return Object.keys(AUDIENCES).map((audience) => ({ audience }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience } = await params;
  const a = AUDIENCES[audience];
  if (!a) return {};
  return {
    title: a.seoTitle,
    description: a.seoDescription,
    alternates: { canonical: `/for/${a.slug}` },
    openGraph: { title: a.seoTitle, description: a.seoDescription },
  };
}

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const a = AUDIENCES[audience];
  if (!a) notFound();

  return <AudienceLander eyebrow={a.eyebrow} headline={a.headline} subhead={a.subhead} pains={a.pains} autopilot={audience === "freelancers"} />;
}
