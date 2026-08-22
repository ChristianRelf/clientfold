"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { createClientAction, type ClientFormState } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";

type ProjectOption = { id: string; label: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add client"}
    </Button>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

export function NewClientForm({ projects }: { projects: ProjectOption[] }) {
  const [state, action] = useActionState<ClientFormState, FormData>(createClientAction, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-5 text-center">
        <p className="text-sm font-medium">{state.clientName} added.</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {state.sent
            ? "We've emailed them a secure link to their portal."
            : "You can invite them to their portal any time."}
        </p>
        {state.inviteUrl ? (
          <a
            href={state.inviteUrl}
            className="mt-3 block break-all rounded-md border border-dashed border-border bg-background px-3 py-2 text-2xs text-accent"
          >
            Dev link: {state.inviteUrl}
          </a>
        ) : null}
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/clients" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
            Done
          </Link>
          <Link href="/clients/new" className="rounded-md border border-border px-4 py-2 text-sm font-medium">
            Add another
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="name" placeholder="Sarah Whitfield" />
      <Field label="Email" name="email" type="email" placeholder="sarah@company.com" />
      <Field label="Company" name="company" placeholder="Northstar Ltd" required={false} />

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Assign to project</span>
        <select
          name="projectId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">No project yet</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-2xs text-muted-foreground">
          A client only sees projects you assign them to.
        </span>
      </label>

      <label className="flex items-center gap-2">
        <input name="sendInvite" type="checkbox" defaultChecked className="size-4 rounded border-input" />
        <span className="text-[13px]">Send them a portal invitation now</span>
      </label>

      {state?.error ? (
        <p className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}
