import { AudienceLander } from "@/components/marketing/audience-lander";
import { landerMetadata } from "@/components/marketing/seo-lander";
import { SEO_LANDERS } from "@/lib/marketing/content";

export const metadata = landerMetadata("client-portal-for-freelancers");

export default function Page() {
  const page = SEO_LANDERS["client-portal-for-freelancers"];
  return <AudienceLander eyebrow="Choosing a client portal" headline="A freelancer client portal that follows up for you." subhead="Give clients one polished place to approve, upload and pay-then let ClientFold handle the gentle reminders." pains={page.pains!} showcase={page.showcase} autopilot />;
}
