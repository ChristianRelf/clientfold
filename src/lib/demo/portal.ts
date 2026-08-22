import type { PortalProjectView } from "@/lib/portal-view";

/** Demo portal view — Sarah Whitfield's view of the Northstar Website Redesign. */
export const DEMO_PORTAL_CLIENT = { name: "Sarah Whitfield", brand: "Northline Studio" };

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const DEMO_PORTAL_PROJECT: PortalProjectView = {
  id: "demo-project",
  name: "Website Redesign",
  slug: "northstar-website-redesign",
  progress: 62,
  nextNote: "Development begins once Homepage Design is approved.",
  milestones: [
    { id: "m1", title: "Discovery", status: "complete" },
    { id: "m2", title: "Wireframes", status: "complete" },
    { id: "m3", title: "Visual Design", status: "in_progress" },
    { id: "m4", title: "Development", status: "upcoming" },
    { id: "m5", title: "Launch", status: "upcoming" },
  ],
  approvals: [
    {
      id: "demo-approval-1",
      title: "Homepage Design",
      description: "Final homepage visual design, desktop and mobile.",
      type: "design",
      status: "awaiting_approval",
      requestedAt: iso(4),
      deadline: iso(-2),
      versions: [
        { id: "v3", version: 3, status: "awaiting_approval", notes: "Addressed feedback", createdAt: iso(1) },
        { id: "v2", version: 2, status: "changes_requested", notes: "Refined hero", createdAt: iso(6) },
        { id: "v1", version: 1, status: "changes_requested", notes: "Initial concepts", createdAt: iso(9) },
      ],
    },
  ],
  fileRequests: [
    {
      id: "fr1",
      title: "Brand Assets",
      instructions: "Please upload the following so we can finalise the design.",
      items: ["Logo (SVG)", "Brand guidelines (PDF)", "Product imagery"],
      status: "pending",
      uploaded: [],
    },
  ],
  sharedFiles: [],
  invoices: [
    { id: "inv1", number: "INV-104", status: "overdue", total: 602000, amountPaid: 0, currency: "GBP", dueDate: iso(8) },
    { id: "inv2", number: "INV-097", status: "paid", total: 350000, amountPaid: 350000, currency: "GBP", dueDate: iso(30) },
  ],
  messages: [
    { id: "msg1", body: "Homepage Concepts v3 uploaded.", authorName: "System", authorType: "system", createdAt: iso(1) },
    { id: "msg2", body: "Here's the updated homepage — let us know what you think!", authorName: "Northline Studio", authorType: "user", createdAt: iso(1) },
    { id: "msg3", body: "Looks great, reviewing with the team today.", authorName: "Sarah Whitfield", authorType: "client", createdAt: iso(0) },
  ],
  messagesUnread: 0,
};
