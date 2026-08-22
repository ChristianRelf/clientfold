import { permanentRedirect } from "next/navigation";

export default async function SignupRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ref?: string; lp?: string }>;
}) {
  const incoming = await searchParams;
  const params = new URLSearchParams();
  if (incoming.plan) params.set("plan", incoming.plan);
  if (incoming.ref) params.set("ref", incoming.ref);
  if (incoming.lp) params.set("lp", incoming.lp);
  const query = params.toString();
  permanentRedirect(`/waitlist${query ? `?${query}` : ""}`);
}
