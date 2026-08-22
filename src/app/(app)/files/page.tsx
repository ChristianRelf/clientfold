import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Files" };
export const dynamic = "force-dynamic";

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function FilesPage() {
  const ctx = await getAppContext();
  const files = await db.file.findMany({
    where: { organisationId: ctx.org.id, archived: false },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader title="Files" description="Project-centric files, served through signed URLs." actions={<Button size="sm">Upload</Button>} />
      <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8">
        {files.length === 0 ? (
          <EmptyState
            title="No files yet."
            description="Files live with their project, milestone or approval. Upload here or request them from a client."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.mimeType.startsWith("image/") ? `/files/${f.id}` : `/api/app/files/${f.id}`}
                className="flex items-center gap-3 px-4 py-3 hairline transition-colors hover:bg-muted/40"
              >
                <span className="grid size-8 place-items-center rounded bg-muted text-2xs font-medium uppercase text-muted-foreground">
                  {f.name.split(".").pop()?.slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-2xs text-muted-foreground">
                    {humanSize(f.size)} · {formatDate(f.createdAt, { day: "numeric", month: "short" })}
                    {f.uploaderType === "client" ? " · from client" : ""}
                  </div>
                </div>
                <span className="hidden text-2xs text-muted-foreground sm:block">
                  {f.mimeType.startsWith("image/") ? "View & comment" : "Download"}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
