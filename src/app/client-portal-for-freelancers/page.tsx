import { AudienceLander } from "@/components/marketing/audience-lander";
import { landerMetadata } from "@/components/marketing/seo-lander";
import { SEO_LANDERS } from "@/lib/marketing/content";

export const metadata = landerMetadata("client-portal-for-freelancers");

export default function Page() {
  const page = SEO_LANDERS["client-portal-for-freelancers"];
  return <AudienceLander eyebrow={page.eyebrow!} headline={page.headline} subhead={page.subhead} pains={page.pains!} showcase={page.showcase} />;
}
