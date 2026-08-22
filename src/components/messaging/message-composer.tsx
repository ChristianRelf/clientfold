"use client";

import { useRef, useState, useTransition } from "react";

/**
 * A minimal message composer. Takes a bound server action `(FormData) => void`
 * so it works for both the portal (client) and the agency inbox (staff). Clears
 * on success; the page's revalidation re-renders the thread with the new message.
 */
export function MessageComposer({
  action,
  placeholder = "Write a message…",
  disabled = false,
}: {
  action: (formData: FormData) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled || !value.trim()) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      setValue("");
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex items-end gap-2">
      <textarea
        name="body"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={disabled ? "Sending is disabled in the demo" : placeholder}
        rows={2}
        disabled={disabled || pending}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        className="min-h-[42px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || pending || !value.trim()}
        className="h-[42px] shrink-0 rounded-md bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
