"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, hashToken, verifyPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";

export type AcceptTeamInviteState = { error?: string } | undefined;

export async function acceptTeamInviteAction(token: string, _state: AcceptTeamInviteState, formData: FormData): Promise<AcceptTeamInviteState> {
  const parsed = z.object({ name: z.string().trim().max(120).optional(), password: z.string().min(8, "Use at least 8 characters") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  const invitation = await db.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!invitation || invitation.clientId || !["member", "admin"].includes(invitation.role) || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return { error: "This invitation is invalid or has expired." };
  }

  let user = await db.user.findUnique({ where: { email: invitation.email.toLowerCase() } });
  if (user) {
    if (!user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) return { error: "That password does not match the invited account." };
  } else {
    if (!parsed.data.name) return { error: "Enter your name to create an account." };
    user = await db.user.create({ data: { email: invitation.email.toLowerCase(), name: parsed.data.name, passwordHash: hashPassword(parsed.data.password) } });
  }

  await db.$transaction([
    db.organisationMember.upsert({
      where: { organisationId_userId: { organisationId: invitation.organisationId, userId: user.id } },
      create: { organisationId: invitation.organisationId, userId: user.id, role: invitation.role },
      update: {},
    }),
    db.invitation.update({ where: { id: invitation.id }, data: { status: "accepted", openedAt: invitation.openedAt ?? new Date(), acceptedAt: new Date() } }),
  ]);
  await createSession(user.id);
  redirect("/home");
}
