import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { listFileComments } from "@/lib/file-comments";
import { ImageAnnotator } from "@/components/files/image-annotator";
import { addPortalFileComment, resolvePortalFileComment } from "../../comment-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "File", robots: { index: false, follow: false } };

export default async function PortalFileView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getPortalClient();
  if (!client) redirect("/portal/enter");

  const file = await db.file.findUnique({ where: { id }, include: { project: true } });
  if (!file?.projectId || !(await assertClientProject(client!.id, file.projectId))) notFound();

  const isImage = file.mimeType.startsWith("image/");
  const comments = await listFileComments(file.id);

  return (
    <div className="mx-auto min-h-screen max-w-4xl">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/portal/files" className="text-muted-foreground hover:text-foreground" aria-label="Back">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{file.name}</div>
          <div className="text-2xs text-muted-foreground">{file.project?.name}</div>
        </div>
      </header>

      <div className="p-4">
        {isImage ? (
          <ImageAnnotator
            fileId={file.id}
            src={`/api/portal/files/${file.id}`}
            fileName={file.name}
            comments={comments}
            viewerType="client"
            viewerName={client!.name}
            addAction={addPortalFileComment}
            resolveAction={resolvePortalFileComment}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
            <p className="text-sm font-medium">This file can&apos;t be previewed.</p>
            <a href={`/api/portal/files/${file.id}`} className="mt-2 inline-block text-[13px] text-accent hover:underline">
              Download it instead
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
