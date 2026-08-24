"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { acceptTeamInviteAction, type AcceptTeamInviteState } from "@/app/(auth)/team-invite/[token]/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="h-10 w-full rounded-md bg-foreground text-[13px] font-semibold text-background disabled:opacity-50">{pending ? "Joining…" : "Accept invitation"}</button>;
}

export function TeamInviteForm({ token, existingAccount }: { token: string; existingAccount: boolean }) {
  const action = acceptTeamInviteAction.bind(null, token);
  const [state, formAction] = useActionState<AcceptTeamInviteState, FormData>(action, undefined);
  return (
    <form action={formAction} className="mt-6 space-y-3.5">
      {!existingAccount ? <label className="block"><span className="mb-1.5 block text-[13px] font-medium">Your name</span><input name="name" required autoComplete="name" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label> : null}
      <label className="block"><span className="mb-1.5 block text-[13px] font-medium">{existingAccount ? "Your ClientFold password" : "Create a password"}</span><input name="password" type="password" minLength={8} required autoComplete={existingAccount ? "current-password" : "new-password"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>
      {state?.error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-[12px] text-danger">{state.error}</p> : null}
      <Submit />
    </form>
  );
}
