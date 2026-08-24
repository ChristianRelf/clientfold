"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { inviteMemberAction, type InviteMemberState } from "@/app/(app)/settings/members/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="h-9 rounded-md bg-foreground px-4 text-xs font-semibold text-background disabled:opacity-50">{pending ? "Inviting…" : "Invite member"}</button>;
}

export function MemberInviteForm({ canInviteAdmin }: { canInviteAdmin: boolean }) {
  const [state, action] = useActionState<InviteMemberState, FormData>(inviteMemberAction, undefined);
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-[13px] font-semibold">Invite a teammate</div>
      <p className="mt-1 text-[11px] text-muted-foreground">They receive a secure 14-day link to create or connect their account.</p>
      <form action={action} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required placeholder="teammate@studio.com" className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <select name="role" className="h-9 rounded-md border border-input bg-background px-3 text-[13px]">
          <option value="member">Member</option>
          {canInviteAdmin ? <option value="admin">Administrator</option> : null}
        </select>
        <Submit />
      </form>
      {state?.error ? <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-[11px] text-danger">{state.error}</p> : null}
      {state?.inviteUrl ? (
        <div className="mt-3 rounded-md bg-surface px-3 py-2 text-[11px]">
          <div className="font-medium">{state.delivered ? "Invitation sent." : "Email is not configured-share this link securely:"}</div>
          <input readOnly value={state.inviteUrl} onFocus={(event) => event.currentTarget.select()} className="mt-1 w-full bg-transparent font-mono text-[10px] text-muted-foreground outline-none" />
        </div>
      ) : null}
    </div>
  );
}
