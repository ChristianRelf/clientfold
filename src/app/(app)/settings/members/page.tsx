import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { MemberInviteForm } from "@/components/app/member-invite-form";
import { removeMemberAction, revokeMemberInviteAction, updateMemberRoleAction } from "./actions";

export const metadata = { title: "Team members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const ctx = await getAppContext();
  const [members, invitations] = await Promise.all([
    db.organisationMember.findMany({ where: { organisationId: ctx.org.id }, include: { user: true }, orderBy: { createdAt: "asc" } }),
    db.invitation.findMany({ where: { organisationId: ctx.org.id, clientId: null, status: "pending" }, orderBy: { createdAt: "desc" } }),
  ]);
  const canManage = ctx.role === "owner" || ctx.role === "admin";

  return (
    <div>
      <PageHeader title="Team members" description="Invite teammates and control workspace permissions." />
      <div className="max-w-3xl space-y-5 p-6">
        {canManage ? <MemberInviteForm canInviteAdmin={ctx.role === "owner"} /> : null}
        <section className="overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-surface px-4 py-3 text-[12px] font-semibold">Current members</div>
          {members.map((member) => {
            const editable = canManage && member.role !== "owner" && member.userId !== ctx.user.id && (ctx.role === "owner" || member.role === "member");
            return (
              <div key={member.id} className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">{member.user.name ?? member.user.email}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{member.user.email}</span>
                </span>
                {editable ? (
                  <div className="flex items-center gap-2">
                    <form action={updateMemberRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="membershipId" value={member.id} />
                      <select name="role" defaultValue={member.role} className="h-8 rounded-md border border-input bg-background px-2 text-[11px]">
                        <option value="member">Member</option>
                        {ctx.role === "owner" ? <option value="admin">Administrator</option> : null}
                      </select>
                      <button className="h-8 rounded-md border border-border px-2.5 text-[10px] font-medium hover:bg-muted">Save</button>
                    </form>
                    <form action={removeMemberAction}>
                      <input type="hidden" name="membershipId" value={member.id} />
                      <button className="h-8 rounded-md px-2.5 text-[10px] font-medium text-danger hover:bg-danger/10">Remove</button>
                    </form>
                  </div>
                ) : <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium capitalize text-muted-foreground">{member.role}</span>}
              </div>
            );
          })}
        </section>
        {invitations.length ? (
          <section className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-surface px-4 py-3 text-[12px] font-semibold">Pending invitations</div>
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px]">{invite.email}</span><span className="text-[10px] capitalize text-muted-foreground">{invite.role} · expires {invite.expiresAt.toLocaleDateString()}</span></span>
                {canManage ? <form action={revokeMemberInviteAction}><input type="hidden" name="invitationId" value={invite.id} /><button className="text-[10px] font-medium text-danger hover:underline">Revoke</button></form> : null}
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
