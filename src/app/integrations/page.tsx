import type { Metadata } from "next";
import Link from "next/link";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TrackedButtonLink } from "@/components/marketing/tracked-button-link";
import { CATEGORY_LABELS, integrationRegistry } from "@/lib/integrations/registry";

export const metadata: Metadata = {
  title: "Integrations",
  description: "See the marketplaces, payment tools, storage services and notification systems supported by ClientFold.",
  alternates: { canonical: "/integrations" },
};

const availability = {
  available: { label: "Available", className: "border-[#b9c8b4] bg-[#e9efe6] text-[#4c6347]" },
  import_only: { label: "Reviewed import", className: "border-[#c8c6b7] bg-[#efeee5] text-[#656252]" },
  approval_required: { label: "Limited import", className: "border-[#d6c4af] bg-[#f4ebe1] text-[#795f43]" },
  coming_soon: { label: "Coming soon", className: "border-[#d4d3cc] bg-[#f7f6f1] text-[#7e8078]" },
} as const;

export default function PublicIntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
            <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Integrations</p><p className="mt-7 max-w-sm text-sm leading-7 text-[#71736b]">Bring work in, keep payment connected, and send useful events out—without pretending every connection does more than it does.</p></div>
            <div><h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.93] tracking-[-0.06em] sm:text-7xl">Your tools keep their job. <span className="font-editorial font-normal italic text-[#5d6857]">ClientFold closes the loop.</span></h1><div className="mt-8 flex flex-wrap gap-3"><TrackedButtonLink placement="integrations_hero" href="/waitlist" size="lg" className="bg-[#2d302a]">Get early access</TrackedButtonLink><Link href="/contact?topic=integration" className="inline-flex h-11 items-center border-b border-[#90958a] px-1 text-xs font-medium text-[#4f584b]">Request an integration →</Link></div></div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2] py-16 sm:py-20">
          <div className="container">
            <div className="flex flex-col justify-between gap-4 border-b border-[#d5d4cd] pb-7 sm:flex-row sm:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Compatibility directory</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">What we support</h2></div><p className="max-w-md text-[11px] leading-5 text-[#777970]">Status labels distinguish live connections from reviewed imports and planned integrations. We never use private APIs or scrape marketplace accounts.</p></div>
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
              const integrations = integrationRegistry.filter((item) => item.category === category);
              return (
                <section key={category} className="grid gap-6 border-b border-[#d5d4cd] py-10 lg:grid-cols-[220px_1fr]">
                  <div><h3 className="text-sm font-medium">{label}</h3><p className="mt-2 text-[10px] text-[#8a8c83]">{integrations.length} {integrations.length === 1 ? "connection" : "connections"}</p></div>
                  <div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-2">
                    {integrations.map((integration) => {
                      const status = availability[integration.availability];
                      return (
                        <article key={integration.provider} className="min-h-56 border-b border-r border-[#d5d4cd] p-5">
                          <div className="flex items-start justify-between gap-4"><IntegrationLogo integration={integration} className="size-10 rounded-md" /><span className={`border px-2 py-1 text-[8px] font-medium uppercase tracking-[0.1em] ${status.className}`}>{status.label}</span></div>
                          <h4 className="mt-8 text-base font-medium">{integration.name}</h4>
                          <p className="mt-2 text-[11px] leading-5 text-[#777970]">{integration.description}</p>
                          <p className="mt-5 text-[9px] uppercase tracking-[0.11em] text-[#8d8f87]">{integration.capabilities.join(" · ")}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section className="bg-[#2d302a] text-white"><div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Missing something?</p><h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.045em]">Tell us which connection would remove the most friction from your week.</h2></div><Link href="/contact?topic=integration" className="inline-flex h-11 items-center bg-[#f3f2ed] px-5 text-xs font-medium text-[#2d302a]">Request an integration →</Link></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
