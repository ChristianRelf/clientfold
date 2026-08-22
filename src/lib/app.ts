import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";

/**
 * Resolve the active organisation for the app shell. Picks the user's most
 * recent membership. Redirects unauthenticated users to /login and users with no
 * organisation to onboarding. This is the single entry point the (app) layout
 * uses so every child page has a guaranteed, verified org context.
 */
export type AppContext = {
  user: SessionUser;
  org: {
    id: string;
    name: string;
    slug: string;
    accentColor: string;
    currency: string;
    plan: string;
    removeBranding: boolean;
  };
  role: string;
  memberships: { id: string; name: string; slug: string }[];
};

export async function getAppContext(): Promise<AppContext> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await db.organisationMember.findMany({
    where: { userId: user.id },
    include: { organisation: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) redirect("/onboarding");

  const active = memberships[0];
  return {
    user,
    org: {
      id: active.organisation.id,
      name: active.organisation.name,
      slug: active.organisation.slug,
      accentColor: active.organisation.accentColor,
      currency: active.organisation.currency,
      plan: active.organisation.plan,
      removeBranding: active.organisation.removeBranding,
    },
    role: active.role,
    memberships: memberships.map((m) => ({
      id: m.organisation.id,
      name: m.organisation.name,
      slug: m.organisation.slug,
    })),
  };
}
