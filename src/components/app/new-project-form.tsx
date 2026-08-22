"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectAction, type ProjectFormState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";

type ClientOption = { id: string; label: string };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create project"}
    </Button>
  );
}

export function NewProjectForm({ clients }: { clients: ClientOption[] }) {
  const [state, action] = useActionState<ProjectFormState, FormData>(createProjectAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Project name</span>
        <input
          name="name"
          required
          placeholder="Website Redesign"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Client</span>
        <select
          name="clientId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">No client yet</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          placeholder="What is this project about?"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Target completion</span>
        <input
          name="targetDate"
          type="date"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
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
