"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPortalLinkAction, type EnterState } from "@/app/portal/enter/actions";
import { Button } from "@/components/ui/button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending…" : "Email me a link"}
    </Button>
  );
}

export function EnterForm() {
  const [state, action] = useActionState<EnterState, FormData>(requestPortalLinkAction, undefined);

  if (state?.sent) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-center">
        <p className="text-sm font-medium">Check your email.</p>
        <p className="mt-1 text-2xs text-muted-foreground">
          If that address has a portal, a secure link is on its way.
        </p>
        {state.devLink ? (
          <a
            href={state.devLink}
            className="mt-3 block break-all rounded-md border border-dashed border-border bg-background px-3 py-2 text-2xs text-accent"
          >
            Dev link: {state.devLink}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input
        name="email"
        type="email"
        required
        placeholder="you@company.com"
        autoComplete="email"
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {state?.error ? <p className="text-2xs text-danger">{state.error}</p> : null}
      <Submit />
    </form>
  );
}
