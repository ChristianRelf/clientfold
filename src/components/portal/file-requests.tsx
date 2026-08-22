"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { PortalFileRequest } from "@/lib/portal-view";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** File requests the client fulfils by uploading. Real upload in the portal. */
export function FileRequests({ requests, demo = false }: { requests: PortalFileRequest[]; demo?: boolean }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center">
        <p className="text-sm font-medium">No files requested.</p>
        <p className="mt-1 text-2xs text-muted-foreground">When the team needs files, they&apos;ll ask here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <RequestCard key={r.id} request={r} demo={demo} />
      ))}
    </div>
  );
}

function RequestCard({ request, demo }: { request: PortalFileRequest; demo: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const complete = request.status === "complete";

  async function upload(files: FileList | null) {
    if (!files || files.length === 0 || demo) return;
    setError(null);
    setBusy(true);
    const body = new FormData();
    body.append("fileRequestId", request.id);
    for (const f of Array.from(files)) body.append("files", f);
    try {
      const res = await fetch("/api/portal/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div>
          <div className="text-sm font-semibold">{request.title}</div>
          {request.instructions ? <p className="mt-0.5 text-2xs text-muted-foreground">{request.instructions}</p> : null}
        </div>
        <Badge tone={complete ? "success" : request.status === "partial" ? "warning" : "waiting"}>
          {complete ? "Complete" : request.status === "partial" ? "In progress" : "Waiting for you"}
        </Badge>
      </div>

      {request.items.length > 0 ? (
        <ul className="divide-y divide-border">
          {request.items.map((item) => (
            <li key={item} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {request.uploaded.length > 0 ? (
        <div className="border-t border-border">
          <div className="px-4 pt-3 text-2xs font-medium uppercase tracking-wide text-muted-foreground">Uploaded</div>
          <ul className="px-4 pb-2">
            {request.uploaded.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-1.5 text-[13px]">
                <a href={`/api/portal/files/${f.id}`} className="truncate text-accent hover:underline">
                  {f.name}
                </a>
                <span className="ml-3 shrink-0 text-2xs text-muted-foreground">{humanSize(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!complete ? (
        <div className="border-t border-border p-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
              dragging ? "border-accent bg-accent/5" : "border-border bg-surface hover:bg-muted/40"
            } ${busy ? "opacity-60" : ""}`}
          >
            <span className="text-[13px] font-medium">
              {busy ? "Uploading…" : demo ? "Uploading is disabled in the demo" : "Drag files here or tap to upload"}
            </span>
            <span className="mt-0.5 text-2xs text-muted-foreground">Up to 100 MB per file</span>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              disabled={busy || demo}
              onChange={(e) => upload(e.target.files)}
            />
          </label>
          {error ? <p className="mt-2 text-2xs text-danger">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
