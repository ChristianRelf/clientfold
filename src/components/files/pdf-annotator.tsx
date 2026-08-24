"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/format";
import type { FileCommentView } from "@/lib/file-comments";

type AddInput = { fileId: string; body: string; page?: number | null; parentId?: string | null };

/** Browser-native PDF preview with feedback anchored to a specific page. */
export function PdfAnnotator({ fileId, src, comments, addAction, resolveAction, readOnly = false }: {
  fileId: string;
  src: string;
  comments: FileCommentView[];
  addAction: (input: AddInput) => Promise<void>;
  resolveAction: (commentId: string, resolved: boolean) => Promise<void>;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState(Math.max(1, comments.find((comment) => comment.page)?.page ?? 1));
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const roots = comments.filter((comment) => !comment.parentId && comment.page === page);
  const replies = useMemo(() => {
    const map = new Map<string, FileCommentView[]>();
    for (const comment of comments) if (comment.parentId) map.set(comment.parentId, [...(map.get(comment.parentId) ?? []), comment]);
    return map;
  }, [comments]);

  const run = (work: () => Promise<void>, clear?: () => void) => startTransition(async () => { await work(); clear?.(); router.refresh(); });
  return <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[11px] font-medium">PDF preview</span>
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground">Page <input type="number" min={1} value={page} onChange={(event) => setPage(Math.max(1, Number(event.target.value) || 1))} className="h-7 w-16 rounded border border-input bg-background px-2 text-[11px] text-foreground" /></label>
      </div>
      <iframe key={page} src={`${src}#page=${page}&view=FitH`} title={`PDF page ${page}`} className="h-[72vh] min-h-[520px] w-full bg-white" />
    </div>
    <div className="space-y-3">
      {!readOnly ? <div className="rounded-lg border border-border p-3"><div className="text-[11px] font-medium">Comment on page {page}</div><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Leave page-specific feedback…" className="mt-2 w-full rounded-md border border-input bg-background px-2.5 py-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring" /><button type="button" disabled={pending || !body.trim()} onClick={() => run(() => addAction({ fileId, body, page }), () => setBody(""))} className="mt-2 rounded-md bg-foreground px-3 py-1.5 text-[10px] font-medium text-background disabled:opacity-50">Add annotation</button></div> : null}
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Page {page} feedback</div>
      {roots.length ? roots.map((comment) => <div key={comment.id} className={`rounded-lg border p-3 ${comment.resolved ? "opacity-65" : ""}`} onClick={() => setActive(comment.id)}><div className="flex items-center justify-between text-[10px] text-muted-foreground"><span><b className="text-foreground">{comment.authorName}</b> · {relativeTime(comment.createdAt)}</span>{!readOnly ? <button type="button" disabled={pending} onClick={(event) => { event.stopPropagation(); run(() => resolveAction(comment.id, !comment.resolved)); }} className="font-medium">{comment.resolved ? "Reopen" : "Resolve"}</button> : null}</div><p className="mt-1.5 whitespace-pre-wrap text-[12px]">{comment.body}</p>{(replies.get(comment.id) ?? []).map((reply) => <div key={reply.id} className="mt-2 border-l-2 border-border pl-2 text-[11px]"><b>{reply.authorName}</b> · {reply.body}</div>)}{!readOnly && active === comment.id ? <div className="mt-2 flex gap-1"><input value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="Reply…" className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-2 text-[10px]" /><button type="button" disabled={pending || !replyBody.trim()} onClick={() => run(() => addAction({ fileId, body: replyBody, parentId: comment.id }), () => setReplyBody(""))} className="rounded bg-muted px-2 text-[10px]">Reply</button></div> : null}</div>) : <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">No feedback on this page.</p>}
    </div>
  </div>;
}
