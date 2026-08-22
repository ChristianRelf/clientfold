"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FileCommentView } from "@/lib/file-comments";

type AddInput = { fileId: string; body: string; x?: number | null; y?: number | null; parentId?: string | null };

/**
 * Pin-based image feedback. Click the image to drop a pin and comment; existing
 * pins are numbered and open a thread in the side panel. Either party can reply
 * or resolve. Deliberately simple — pin, discuss, resolve. Not a Figma clone.
 */
export function ImageAnnotator({
  fileId,
  src,
  fileName,
  comments,
  viewerType,
  viewerName,
  addAction,
  resolveAction,
  readOnly = false,
}: {
  fileId: string;
  src: string;
  fileName: string;
  comments: FileCommentView[];
  viewerType: "user" | "client";
  viewerName: string;
  addAction: (input: AddInput) => Promise<void>;
  resolveAction: (commentId: string, resolved: boolean) => Promise<void>;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const imgWrap = useRef<HTMLDivElement>(null);

  const { roots, repliesByParent } = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId);
    const repliesByParent = new Map<string, FileCommentView[]>();
    for (const c of comments) {
      if (c.parentId) {
        const list = repliesByParent.get(c.parentId) ?? [];
        list.push(c);
        repliesByParent.set(c.parentId, list);
      }
    }
    return { roots, repliesByParent };
  }, [comments]);

  const pinned = roots.filter((r) => r.x != null && r.y != null);

  function onImageClick(e: React.MouseEvent) {
    if (readOnly || !imgWrap.current) return;
    const rect = imgWrap.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setDraftPin({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) });
    setActive(null);
  }

  function submitPin() {
    if (!draftPin || !draftBody.trim()) return;
    startTransition(async () => {
      await addAction({ fileId, body: draftBody, x: draftPin.x, y: draftPin.y });
      setDraftPin(null);
      setDraftBody("");
      router.refresh();
    });
  }

  function submitReply(parentId: string) {
    if (!replyBody.trim()) return;
    startTransition(async () => {
      await addAction({ fileId, body: replyBody, parentId });
      setReplyBody("");
      router.refresh();
    });
  }

  function toggleResolve(c: FileCommentView) {
    startTransition(async () => {
      await resolveAction(c.id, !c.resolved);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Canvas */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div
          ref={imgWrap}
          onClick={onImageClick}
          className={cn("relative select-none", !readOnly && "cursor-crosshair")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={fileName} className="block w-full" />
          {pinned.map((c, i) => (
            <button
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                setActive(c.id);
                setDraftPin(null);
              }}
              style={{ left: `${(c.x ?? 0) * 100}%`, top: `${(c.y ?? 0) * 100}%` }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full border-2 border-white text-2xs font-semibold shadow-pop transition-transform hover:scale-110",
                c.resolved ? "bg-success text-white" : active === c.id ? "bg-foreground text-background" : "bg-accent text-accent-foreground",
              )}
              title={c.authorName}
            >
              {i + 1}
            </button>
          ))}
          {draftPin ? (
            <span
              style={{ left: `${draftPin.x * 100}%`, top: `${draftPin.y * 100}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full border-2 border-dashed border-accent bg-background/70 text-2xs"
            >
              +
            </span>
          ) : null}
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-3">
        {draftPin ? (
          <div className="animate-fade-in rounded-lg border border-accent/30 bg-accent/5 p-3">
            <div className="text-2xs font-medium text-accent">New comment at pin</div>
            <textarea
              autoFocus
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={3}
              placeholder="What needs changing here?"
              className="mt-2 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={submitPin}
                disabled={pending || !draftBody.trim()}
                className="rounded-md bg-foreground px-3 py-1.5 text-2xs font-medium text-background disabled:opacity-50"
              >
                Comment
              </button>
              <button onClick={() => setDraftPin(null)} className="rounded-md px-3 py-1.5 text-2xs text-muted-foreground hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        ) : !readOnly ? (
          <p className="rounded-lg border border-dashed border-border bg-surface px-3 py-2.5 text-2xs text-muted-foreground">
            Click anywhere on the image to leave a pinned comment.
          </p>
        ) : null}

        {roots.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No feedback yet.</p>
        ) : (
          roots.map((c, i) => {
            const replies = repliesByParent.get(c.id) ?? [];
            const isPin = c.x != null;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-lg border p-3",
                  active === c.id ? "border-accent/40 ring-1 ring-accent/20" : "border-border",
                  c.resolved && "opacity-70",
                )}
                onMouseEnter={() => isPin && setActive(c.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                    {isPin ? (
                      <span className="grid size-4 place-items-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
                        {pinned.findIndex((p) => p.id === c.id) + 1}
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground">{c.authorName}</span>
                    <span>· {relativeTime(c.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => toggleResolve(c)}
                    disabled={pending}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      c.resolved ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {c.resolved ? "Resolved ✓" : "Resolve"}
                  </button>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px]">{c.body}</p>

                {replies.map((r) => (
                  <div key={r.id} className="mt-2 border-l-2 border-border pl-2.5">
                    <div className="text-2xs text-muted-foreground">
                      <span className="font-medium text-foreground">{r.authorName}</span> · {relativeTime(r.createdAt)}
                    </div>
                    <p className="whitespace-pre-wrap text-[13px]">{r.body}</p>
                  </div>
                ))}

                {!readOnly && active === c.id ? (
                  <div className="mt-2 flex gap-1.5">
                    <input
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Reply…"
                      className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-2xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      onClick={() => submitReply(c.id)}
                      disabled={pending || !replyBody.trim()}
                      className="rounded-md bg-muted px-2.5 text-2xs font-medium disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
