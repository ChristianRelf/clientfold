/** View-models the portal renders - mapped from DB (real) or demo data. */

export type PortalApprovalVersion = {
  id: string;
  version: number;
  status: string;
  notes: string | null;
  createdAt: string; // ISO
};

export type PortalApproval = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string; // draft | awaiting_approval | approved | changes_requested | withdrawn
  requestedAt: string | null;
  deadline: string | null;
  versions: PortalApprovalVersion[];
};

export type PortalFileRequest = {
  id: string;
  title: string;
  instructions: string | null;
  items: string[];
  status: string; // pending | partial | complete
  uploaded: { id: string; name: string; size: number }[];
};

export type PortalInvoice = {
  id: string;
  number: string;
  status: string;
  total: number; // minor units
  amountPaid: number;
  currency: string;
  dueDate: string | null;
};

export type PortalMessage = {
  id: string;
  body: string;
  authorName: string;
  authorType: string;
  createdAt: string;
  attachments?: { id: string; name: string; mimeType: string; size: number }[];
};

export type PortalMilestone = { id: string; title: string; status: string };

export type PortalSharedFile = { id: string; name: string; isImage: boolean };

export type PortalProjectView = {
  id: string;
  name: string;
  slug: string;
  progress: number;
  nextNote: string | null;
  milestones: PortalMilestone[];
  approvals: PortalApproval[];
  fileRequests: PortalFileRequest[];
  sharedFiles: PortalSharedFile[];
  invoices: PortalInvoice[];
  messages: PortalMessage[];
  messagesUnread: number;
};

/** Items that "need the client" - drives the overview attention list. */
export function attentionItems(p: PortalProjectView) {
  const items: { kind: "approval" | "file"; id: string; title: string; detail: string; href: string }[] = [];
  for (const a of p.approvals) {
    if (a.status === "awaiting_approval") {
      items.push({ kind: "approval", id: a.id, title: a.title, detail: "Approval requested", href: `/portal/approvals` });
    }
  }
  for (const fr of p.fileRequests) {
    if (fr.status !== "complete") {
      const n = fr.items.length;
      items.push({ kind: "file", id: fr.id, title: fr.title, detail: `${n} file${n === 1 ? "" : "s"} requested`, href: `/portal/files` });
    }
  }
  return items;
}
