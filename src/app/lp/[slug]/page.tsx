import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CAMPAIGNS } from "@/lib/marketing/content";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Showcase } from "@/components/marketing/showcase";

export function generateStaticParams() {
  return Object.keys(CAMPAIGNS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = CAMPAIGNS[slug];
  if (!c) return {};
  return {
    title: c.headline,
    description: c.subhead,
    // Campaign pages are conversion pages, not SEO targets.
    robots: { index: false, follow: true },
    openGraph: { title: c.headline, description: c.subhead },
  };
}

/**
 * Campaign landing page. Minimal chrome, single CTA, real product surface.
 * Campaign context (the slug) is carried into signup so onboarding can suggest
 * a relevant first step - without cloaking; the page stays semantically honest.
 */
export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = CAMPAIGNS[slug];
  if (!c) notFound();

  const signupHref = c.signupContext ? `/waitlist?lp=${c.signupContext}` : "/waitlist";

  return (
    <div className="min-h-screen bg-[#f3f2ed] text-[#292b26]">
      <header className="container flex h-16 items-center justify-between border-b border-[#d9d8d2]">
        <Wordmark className="text-[15px]" />
        <ButtonLink href={signupHref} size="sm">
          {c.cta}
        </ButtonLink>
      </header>

      <main className="container pb-20 pt-12 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center" data-reveal="soft">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">A calmer client workflow</p>
          <h1 className="mt-5 text-balance text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{c.headline}</h1>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-6 text-[#71736b]">{c.subhead}</p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <ButtonLink href={signupHref} size="lg">
              {c.cta}
            </ButtonLink>
            <ButtonLink href="/demo" size="lg" variant="outline">
              View demo
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-4xl" data-reveal>
          <Showcase kind={c.showcase} />
        </div>
      </main>
    </div>
  );
}
