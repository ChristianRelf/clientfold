import Link from "next/link";
import { resolveActivePortal } from "@/lib/portal";
import { PortalFrame } from "@/components/portal/portal-frame";
import { FileRequests } from "@/components/portal/file-requests";

export const dynamic = "force-dynamic";

export default async function PortalFiles() {
  const { ctx, project } = await resolveActivePortal();
  return (
    <PortalFrame
      project={project}
      brand={ctx.branding.portalName ?? ctx.branding.organisationName}
      clientName={ctx.client.name}
      poweredBy={!ctx.branding.removeBranding}
    >
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Files</h1>

      {project.sharedFiles.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground">From your team</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            {project.sharedFiles.map((f) => (
              <Link
                key={f.id}
                href={f.isImage ? `/portal/files/view/${f.id}` : `/api/portal/files/${f.id}`}
                className="flex items-center justify-between px-4 py-3 hairline transition-colors hover:bg-muted/40"
              >
                <span className="truncate text-[13px] font-medium">{f.name}</span>
                <span className="shrink-0 text-2xs text-accent">{f.isImage ? "View & comment" : "Download"}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <FileRequests requests={project.fileRequests} />
    </PortalFrame>
  );
}
