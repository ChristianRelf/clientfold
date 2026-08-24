import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/auth/crypto";
import { TeamInviteForm } from "@/components/auth/team-invite-form";

export const metadata = { title: "Join workspace" };
export const dynamic = "force-dynamic";

export default async function TeamInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.invitation.findUnique({ where: { tokenHash: hashToken(token) }, include: { organisation: true } });
  if (!invitation || invitation.clientId || !["member", "admin"].includes(invitation.role)) notFound();
  const invalid = invitation.status !== "pending" || invitation.expiresAt < new Date();
  const existing = await db.user.findUnique({ where: { email: invitation.email.toLowerCase() }, select: { id: true } });
  return <div><h1 className="text-lg font-semibold tracking-tight">Join {invitation.organisation.name}</h1><p className="mt-1 text-[13px] text-muted-foreground">You were invited as {invitation.role} using {invitation.email}.</p>{invalid ? <p className="mt-6 rounded-md bg-danger/10 px-3 py-2 text-[12px] text-danger">This invitation is no longer available. Ask a workspace administrator for a new one.</p> : <TeamInviteForm token={token} existingAccount={Boolean(existing)} />}</div>;
}
