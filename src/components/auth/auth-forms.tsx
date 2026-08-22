"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction, type ActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Just a moment…" : children}
    </Button>
  );
}

function ErrorNote({ state }: { state: ActionState }) {
  if (!state?.error) return null;
  return (
    <p className="rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-[13px] text-danger">
      {state.error}
    </p>
  );
}

export function SignupForm({ plan, referral }: { plan?: string; referral?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signupAction, undefined);
  return (
    <form action={action} className="space-y-3.5">
      {plan ? <input type="hidden" name="plan" value={plan} /> : null}
      {referral ? <input type="hidden" name="ref" value={referral} /> : null}
      <Field label="Your name" name="name" autoComplete="name" placeholder="Sam Rivera" />
      <Field label="Work email" name="email" type="email" autoComplete="email" placeholder="you@studio.com" />
      <Field label="Organisation" name="organisation" placeholder="Your studio or agency" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" />
      <ErrorNote state={state} />
      <Submit>Create workspace</Submit>
    </form>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="space-y-3.5">
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      <ErrorNote state={state} />
      <Submit>Log in</Submit>
    </form>
  );
}
