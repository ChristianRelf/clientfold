import { db } from "@/lib/db";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";

/**
 * Server-side multi-tenancy. Every tenant-scoped read/write must go through a
 * resolved membership so Organisation A can never touch Organisation B. We NEVER
 * trust an organisationId supplied by the client - callers pass a slug or id and
 * we verify the current user actually belongs to it.
 */

export type Role = "owner" | "admin" | "member";

const ROLE_RANK: Record<Role, number> = { member: 1, admin: 2, owner: 3 };

export class AuthError extends Error {}
export class ForbiddenError extends Error {}

export type OrgContext = {
  user: SessionUser;
  organisationId: string;
  role: Role;
};

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not authenticated");
  return user;
}

/** Resolve + verify the current user's membership of an organisation by slug. */
export async function requireOrg(slug: string): Promise<OrgContext> {
  const user = await requireUser();
  const org = await db.organisation.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!org) throw new ForbiddenError("Organisation not found");

  const membership = await db.organisationMember.findUnique({
    where: { organisationId_userId: { organisationId: org.id, userId: user.id } },
    select: { role: true },
  });
  if (!membership) throw new ForbiddenError("Not a member of this organisation");

  return { user, organisationId: org.id, role: membership.role as Role };
}

/** Assert a minimum role (owner > admin > member). Enforced server-side only. */
export function assertRole(ctx: OrgContext, minimum: Role): void {
  if (ROLE_RANK[ctx.role] < ROLE_RANK[minimum]) {
    throw new ForbiddenError(`Requires ${minimum} role`);
  }
}

/**
 * Fetch a project ensuring it belongs to the org in context. Returns null if it
 * doesn't exist OR belongs to another tenant - callers must treat both as 404 to
 * avoid leaking existence (IDOR-safe).
 */
export async function getScopedProject(ctx: OrgContext, slug: string) {
  return db.project.findFirst({
    where: { slug, organisationId: ctx.organisationId },
  });
}

/** Gate for internal-only routes (/internal growth dashboard). */
export async function requireInternal(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isInternal) throw new ForbiddenError("Internal access only");
  return user;
}
