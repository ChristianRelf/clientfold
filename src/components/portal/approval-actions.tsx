"use client";

import { useState, useTransition } from "react";
import { respondToApproval, type ApprovalActionState } from "@/app/portal/actions";

/**
 * The flagship client action. Approving asks for explicit confirmation - "by
 * approving this version you confirm the project may proceed using it" - so the
 * decision is deliberate and defensible. Disabled in demo mode.
 */
export function ApprovalActions({
  approvalId,
  version,
  title,
  demo = false,
}: {
  approvalId: string;
  version: number;
  title: string;
  demo?: boolean;
}) {
  const [mode, setMode] = useState<null | "approve" | "changes">(null);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ApprovalActionState>();

  if (result?.ok) {
    return (
      <div className="animate-scale-in rounded-lg border border-success/30 bg-success/5 p-4 text-center">
        <div className="mx-auto grid size-9 animate-check place-items-center rounded-full bg-success text-white">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M13 4.5 6.5 11 3 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium">
          {result.decision === "approved" ? "Approved" : "Changes requested"}
        </p>
        <p className="mt-0.5 text-2xs text-muted-foreground">Thanks - we&apos;ve let the team know.</p>
      </div>
    );
  }

  function submit(decision: "approved" | "changes_requested") {
    if (demo) {
      setResult({ ok: true, decision });
      return;
    }
    startTransition(async () => {
      const res = await respondToApproval({ approvalId, decision, comment });
      setResult(res);
    });
  }

  if (mode === null) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setMode("approve")}
          className="flex-1 rounded-md bg-success px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-success/90"
        >
          Approve
        </button>
        <button
          onClick={() => setMode("changes")}
          className="flex-1 rounded-md border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
        >
          Request changes
        </button>
      </div>
    );
  }

  const approving = mode === "approve";
  return (
    <div className="animate-fade-in rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-medium">
        {approving ? `Approve “${title}”?` : `Request changes to “${title}”?`}
      </p>
      <p className="mt-1 text-2xs text-muted-foreground">
        {approving
          ? `By approving version ${version} you confirm that the project may proceed using it.`
          : "Tell the team what needs changing. They'll send a new version."}
      </p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={approving ? "Add a comment (optional)" : "What should change?"}
        className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {result?.error ? <p className="mt-2 text-2xs text-danger">{result.error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          disabled={pending || (!approving && comment.trim().length === 0)}
          onClick={() => submit(approving ? "approved" : "changes_requested")}
          className={
            approving
              ? "flex-1 rounded-md bg-success px-3 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              : "flex-1 rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background disabled:opacity-50"
          }
        >
          {pending ? "Saving…" : approving ? "Confirm approval" : "Send request"}
        </button>
        <button
          onClick={() => setMode(null)}
          className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
