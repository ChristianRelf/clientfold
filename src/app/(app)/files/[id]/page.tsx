import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { listFileComments } from "@/lib/file-comments";
import { ImageAnnotator } from "@/components/files/image-annotator";
import { addAgencyFileComment, resolveAgencyFileComment } from "../comment-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "File" };

export default async function AgencyFileView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAppContext();

  const file = await db.file.findFirst({
    where: { id, organisationId: ctx.org.id },
    include: { project: true },
  });
  if (!file) notFound();

  const isImage = file.mimeType.startsWith("image/");
  const comments = await listFileComments(file.id);

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Link href="/files" className="text-muted-foreground hover:text-foreground" aria-label="Back to files">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{file.name}</div>
          <div className="text-2xs text-muted-foreground">{file.project?.name ?? "—"}</div>
        </div>
        <a href={`/api/app/files/${file.id}`} className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted">
          Download
        </a>
      </div>

      <div className="p-6">
        {isImage ? (
          <ImageAnnotator
            fileId={file.id}
            src={`/api/app/files/${file.id}`}
            fileName={file.name}
            comments={comments}
            viewerType="user"
            viewerName={ctx.user.name ?? "You"}
            addAction={addAgencyFileComment}
            resolveAction={resolveAgencyFileComment}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
            <p className="text-sm font-medium">Preview not available for this file type.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Download it to view.</p>
          </div>
        )}
      </div>
    </div>
  );
}
