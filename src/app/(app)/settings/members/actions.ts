"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAppContext } from "@/lib/app";
import { createTeamInvitation } from "@/lib/auth/invitations";
import { sendTeamInvitation } from "@/lib/email";

export type InviteMemberState = { error?: string; inviteUrl?: string; delivered?: boolean } | undefined;

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["member", "admin"]),
});

function canManage(role: string) {
  return role === "owner" || role === "admin";
}

export async function inviteMemberAction(_state: InviteMemberState, formData: FormData): Promise<InviteMemberState> {
  const ctx = await getAppContext();
  if (!canManage(ctx.role)) return { error: "You do not have permission to invite members." };
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and role." };
  if (ctx.role !== "owner" && parsed.data.role === "admin") return { error: "Only an owner can invite an administrator." };

  const existing = await db.organisationMember.findFirst({
    where: { organisationId: ctx.org.id, user: { email: parsed.data.email } },
  });
  if (existing) return { error: "That person is already a workspace member." };

  const invitation = await createTeamInvitation({ organisationId: ctx.org.id, ...parsed.data });
  const delivery = await sendTeamInvitation(parsed.data.email, invitation.url, ctx.org.name, parsed.data.role);
  revalidatePath("/settings/members");
  return { inviteUrl: invitation.url, delivered: delivery.accepted };
}

export async function updateMemberRoleAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  if (!canManage(ctx.role)) return;
  const parsed = z.object({ membershipId: z.string().min(1), role: z.enum(["admin", "member"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const target = await db.organisationMember.findFirst({ where: { id: parsed.data.membershipId, organisationId: ctx.org.id } });
  if (!target || target.role === "owner") return;
  if (ctx.role !== "owner" && (target.role === "admin" || parsed.data.role === "admin")) return;
  await db.organisationMember.update({ where: { id: target.id }, data: { role: parsed.data.role } });
  revalidatePath("/settings/members");
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  if (!canManage(ctx.role)) return;
  const id = formData.get("membershipId");
  if (typeof id !== "string") return;
  const target = await db.organisationMember.findFirst({ where: { id, organisationId: ctx.org.id } });
  if (!target || target.role === "owner" || target.userId === ctx.user.id) return;
  if (ctx.role !== "owner" && target.role === "admin") return;
  await db.organisationMember.delete({ where: { id: target.id } });
  revalidatePath("/settings/members");
}

export async function revokeMemberInviteAction(formData: FormData): Promise<void> {
  const ctx = await getAppContext();
  if (!canManage(ctx.role)) return;
  const id = formData.get("invitationId");
  if (typeof id !== "string") return;
  await db.invitation.updateMany({
    where: { id, organisationId: ctx.org.id, clientId: null, status: "pending" },
    data: { status: "revoked" },
  });
  revalidatePath("/settings/members");
}
