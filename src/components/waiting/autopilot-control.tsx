"use client";

import { useState, useTransition } from "react";
import { setWaitingItemAutopilotStateAction } from "@/app/(app)/waiting/actions";

export function AutopilotControl({ waitingItemId, paused }: { waitingItemId: string; paused: boolean }) {
  const [currentPaused, setCurrentPaused] = useState(paused);
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => {
        const next = !currentPaused;
        const result = await setWaitingItemAutopilotStateAction(waitingItemId, next);
        if (result.ok) setCurrentPaused(next);
      })}
      className="rounded-md px-2 py-1 text-2xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      {pending ? "Saving…" : currentPaused ? "Resume" : "Pause"}
    </button>
  );
}
