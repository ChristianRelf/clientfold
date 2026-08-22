"use client";

import { useState, useTransition } from "react";
import { sendReminderAction } from "@/app/(app)/waiting/actions";
import { cn } from "@/lib/utils";

/**
 * One-click reminder from the Waiting Room. Shows a transient confirmation,
 * surfaces the anti-spam cooldown message, and disables in the demo.
 */
export function RemindButton({ waitingItemId, demo = false }: { waitingItemId: string; demo?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function remind() {
    if (demo) return;
    setState("idle");
    setMessage(null);
    startTransition(async () => {
      const res = await sendReminderAction(waitingItemId);
      if (res.ok) {
        setState("sent");
        setMessage(res.sent ? "Reminder sent" : "Reminder logged");
      } else {
        setState("error");
        setMessage(res.error);
      }
    });
  }

  if (state === "sent") {
    return <span className="px-2.5 py-1 text-xs font-medium text-success">{message}</span>;
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={remind}
        disabled={demo || pending}
        title={demo ? "Disabled in demo" : "Send a reminder"}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40",
          state === "error"
            ? "text-danger hover:bg-danger/10"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {pending ? "Sending…" : "Remind"}
      </button>
      {state === "error" && message ? (
        <span className="absolute right-0 top-full z-10 mt-1 w-max max-w-56 rounded-md border border-border bg-background px-2 py-1 text-2xs text-danger shadow-pop">
          {message}
        </span>
      ) : null}
    </span>
  );
}
