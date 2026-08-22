import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Showcase } from "@/components/marketing/showcase";
import { PricingTable } from "@/components/marketing/pricing-table";
import { SEO_LANDERS } from "@/lib/marketing/content";

export function landerMetadata(slug: keyof typeof SEO_LANDERS): Metadata {
  const c = SEO_LANDERS[slug];
  return {
    title: c.headline,
    description: c.subhead,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: c.headline, description: c.subhead },
  };
}

export function SeoLander({ slug }: { slug: keyof typeof SEO_LANDERS }) {
  const c = SEO_LANDERS[slug];
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]">
        <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center" data-reveal="soft">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">ClientFold</p>
          <h1 className="mt-5 text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{c.headline}</h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-6 text-[#71736b]">{c.subhead}</p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <ButtonLink href="/waitlist" size="lg" className="bg-[#2d302a] hover:bg-[#44473f]">{c.cta}</ButtonLink>
            <ButtonLink href="/demo" size="lg" variant="outline" className="border-[#c9c8c1] bg-transparent">View demo</ButtonLink>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-4xl" data-reveal>
          <Showcase kind={c.showcase} />
        </div>
        </div>
      </section>
      <section className="container py-20 sm:py-28">
        <h2 className="text-center text-3xl font-medium tracking-[-0.035em]">Simple pricing</h2>
        <div className="mt-8">
          <PricingTable />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
