import { db } from "@/lib/db";
import { generateToken, hashToken } from "./crypto";

/**
 * Client invitations / magic links. Tokens are cryptographically secure, only
 * their hash is stored, they expire, and they are revocable (status = revoked).
 * The raw token is returned exactly once at creation time — to be emailed.
 */

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export type CreatedInvitation = { id: string; token: string; url: string };

export async function createClientInvitation(params: {
  organisationId: string;
  clientId: string;
  email: string;
  role?: string;
}): Promise<CreatedInvitation> {
  const token = generateToken(32);
  const invitation = await db.invitation.create({
    data: {
      organisationId: params.organisationId,
      clientId: params.clientId,
      email: params.email,
      role: params.role ?? "client",
      tokenHash: hashToken(token),
      status: "pending",
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return { id: invitation.id, token, url: `${base}/invite/${token}` };
}

export type RedeemResult =
  | { ok: true; clientId: string; organisationId: string }
  | { ok: false; reason: "invalid" | "expired" | "revoked" | "no_client" };

/** Validate + consume an invitation. Marks it accepted on success. */
export async function redeemInvitation(token: string): Promise<RedeemResult> {
  const invitation = await db.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invitation) return { ok: false, reason: "invalid" };
  if (invitation.status === "revoked") return { ok: false, reason: "revoked" };
  if (invitation.expiresAt < new Date()) {
    await db.invitation.update({ where: { id: invitation.id }, data: { status: "expired" } }).catch(() => {});
    return { ok: false, reason: "expired" };
  }
  if (!invitation.clientId) return { ok: false, reason: "no_client" };

  await db.invitation.update({
    where: { id: invitation.id },
    data: {
      status: "accepted",
      openedAt: invitation.openedAt ?? new Date(),
      acceptedAt: new Date(),
    },
  });

  return { ok: true, clientId: invitation.clientId, organisationId: invitation.organisationId };
}

/** Issue a fresh link to an existing client by email (self-service re-entry). */
export async function issueLinkByEmail(email: string): Promise<CreatedInvitation | null> {
  const client = await db.client.findFirst({ where: { email } });
  if (!client) return null;
  return createClientInvitation({ organisationId: client.organisationId, clientId: client.id, email });
}
