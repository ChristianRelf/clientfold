"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { hashIp } from "@/lib/auth/crypto";
import { trackEvent } from "@/lib/marketing/events";
import { clientIpHint } from "@/lib/marketing/attribution";
import { notifyMembers } from "@/lib/notifications";

export type ApprovalActionState = { ok: true; decision: "approved" | "changes_requested" } | { ok?: false; error: string };

const schema = z.object({
  approvalId: z.string().min(1),
  decision: z.enum(["approved", "changes_requested"]),
  comment: z.string().max(2000).optional(),
});

/**
 * The flagship client action. Verifies the portal client owns the approval's
 * project, then writes an IMMUTABLE ApprovalResponse, advances the latest
 * version + approval status, resolves the matching Waiting item, and records
 * activity. Approval history is append-only — we never mutate past responses.
 */
export async function respondToApproval(input: z.infer<typeof schema>): Promise<ApprovalActionState> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request" };

  const client = await getPortalClient();
  if (!client) return { error: "Your session has expired. Please open your link again." };

  const { approvalId, decision, comment } = parsed.data;

  const approval = await db.approval.findUnique({
    where: { id: approvalId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, project: true },
  });
  if (!approval) return { error: "Approval not found" };

  // Tenancy + assignment: the client must be assigned to this approval's project.
  const allowed = await assertClientProject(client.id, approval.projectId);
  if (!allowed) return { error: "You don't have access to this item" };

  if (approval.status !== "awaiting_approval") {
    return { error: "This approval has already been actioned" };
  }

  const latest = approval.versions[0];
  if (!latest) return { error: "No version to approve" };

  const ip = await clientIpHint();

  await db.$transaction(async (tx) => {
    // 1. Immutable audit record of the decision.
    await tx.approvalResponse.create({
      data: {
        approvalId: approval.id,
        versionId: latest.id,
        decision,
        comment: comment?.trim() || null,
        actorType: "client",
        actorId: client.id,
        actorName: client.name,
        ipHash: hashIp(ip),
      },
    });

    // 2. Advance version + approval status.
    await tx.approvalVersion.update({
      where: { id: latest.id },
      data: { status: decision === "approved" ? "approved" : "changes_requested" },
    });
    await tx.approval.update({
      where: { id: approval.id },
      data: { status: decision === "approved" ? "approved" : "changes_requested" },
    });

    // 3. Resolve the matching Waiting item so it clears the agency Waiting Room.
    await tx.waitingItem.updateMany({
      where: { projectId: approval.projectId, type: "approval", title: approval.title, status: "waiting" },
      data: { status: "resolved", resolvedAt: new Date() },
    });

    // 4. Activity for the agency feed (no confidential payload).
    await tx.activity.create({
      data: {
        organisationId: approval.project.organisationId,
        projectId: approval.projectId,
        type: decision === "approved" ? "approval.approved" : "approval.changes_requested",
        actorType: "client",
        actorId: client.id,
        actorName: client.name,
        summary:
          decision === "approved"
            ? `${client.name} approved ${approval.title}`
            : `${client.name} requested changes on ${approval.title}`,
      },
    });
  });

  await trackEvent(
    decision === "approved" ? "approval.approved" : "waiting.item_resolved",
    { organisationId: approval.project.organisationId },
    { type: "approval" },
  );
  await trackEvent("client.action_completed", { organisationId: approval.project.organisationId }, { type: "approval" });
  await notifyMembers({
    organisationId: approval.project.organisationId,
    type: decision === "approved" ? "approval.approved" : "approval.changes_requested",
    title: decision === "approved" ? `${client.name} approved ${approval.title}` : `${client.name} requested changes`,
    body: decision === "changes_requested" ? approval.title : null,
    href: `/projects/${approval.project.slug}`,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/approvals");
  return { ok: true, decision };
}
