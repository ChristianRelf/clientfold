import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redeemInvitation } from "@/lib/auth/invitations";
import { createPortalSession } from "@/lib/auth/portal-session";
import { trackEvent } from "@/lib/marketing/events";

/**
 * Magic-link redemption. Validates the token, opens a client portal session and
 * sends the client to their portal. On failure we send them to /portal/enter to
 * request a fresh link — never expose why (avoid enumeration).
 */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await redeemInvitation(token);

  if (!result.ok) {
    const url = new URL("/portal/enter", request.url);
    url.searchParams.set("expired", "1");
    return NextResponse.redirect(url);
  }

  await createPortalSession(result.clientId);

  // Activation signals: the client opened their invitation and the portal.
  await db.client.update({ where: { id: result.clientId }, data: { lastActiveAt: new Date() } }).catch(() => {});
  await trackEvent("client.invitation_opened", { organisationId: result.organisationId }, {});

  // Mark the organisation activated if it meets the criteria (has project +
  // client + the client has now opened the portal + at least one action later).
  await maybeActivate(result.organisationId);

  return NextResponse.redirect(new URL("/portal", request.url));
}

async function maybeActivate(organisationId: string) {
  try {
    const org = await db.organisation.findUnique({ where: { id: organisationId }, select: { activatedAt: true } });
    if (org?.activatedAt) return;
    const [projects, clients] = await Promise.all([
      db.project.count({ where: { organisationId } }),
      db.client.count({ where: { organisationId, lastActiveAt: { not: null } } }),
    ]);
    if (projects > 0 && clients > 0) {
      await db.organisation.update({ where: { id: organisationId }, data: { activatedAt: new Date() } });
      await trackEvent("client.action_completed", { organisationId }, { type: "portal_opened" });
    }
  } catch {
    /* noop */
  }
}
