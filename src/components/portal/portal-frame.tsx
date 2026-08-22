import { PortalShell, type PortalTab } from "./portal-shell";
import type { PortalProjectView } from "@/lib/portal-view";

/**
 * Server wrapper that computes which portal sections apply (unused ones are
 * hidden) and renders the shell. Works for both the real portal and the demo by
 * passing a different basePath + branding.
 */
export function PortalFrame({
  project,
  brand,
  clientName,
  poweredBy = true,
  basePath = "/portal",
  children,
}: {
  project: PortalProjectView;
  brand: string;
  clientName: string;
  poweredBy?: boolean;
  basePath?: string;
  children: React.ReactNode;
}) {
  const awaiting = project.approvals.filter((a) => a.status === "awaiting_approval").length;
  const pendingFiles = project.fileRequests.filter((f) => f.status !== "complete").length;
  const unpaid = project.invoices.filter((i) => !["paid", "cancelled"].includes(i.status)).length;

  const tabs: PortalTab[] = [{ key: "overview", label: "Overview", href: basePath }];
  if (project.approvals.length > 0) tabs.push({ key: "approvals", label: "Approvals", href: `${basePath}/approvals`, badge: awaiting || undefined });
  if (project.fileRequests.length > 0 || project.sharedFiles.length > 0)
    tabs.push({ key: "files", label: "Files", href: `${basePath}/files`, badge: pendingFiles || undefined });
  if (project.messages.length > 0)
    tabs.push({ key: "messages", label: "Messages", href: `${basePath}/messages`, badge: project.messagesUnread || undefined });
  if (project.invoices.length > 0) tabs.push({ key: "invoices", label: "Invoices", href: `${basePath}/invoices`, badge: unpaid || undefined });

  return (
    <PortalShell
      brand={brand}
      projectName={project.name}
      clientName={clientName}
      tabs={tabs}
      poweredBy={poweredBy}
      basePath={basePath}
    >
      {children}
    </PortalShell>
  );
}
