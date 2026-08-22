/**
 * The Northline Studio demo dataset — one source of truth shared by the Prisma
 * seed, the interactive /demo, and the marketing screenshots. Realistic, never
 * lorem ipsum / Acme / John Doe. These figures are DEMO DATA and must never be
 * presented as real customer metrics.
 */

export type WaitingType = "approval" | "file_request" | "payment" | "task" | "reply";

export type DemoWaitingItem = {
  id: string;
  client: string;
  clientCompany: string;
  project: string;
  projectSlug: string;
  type: WaitingType;
  title: string;
  detail: string;
  daysWaiting: number;
  amount?: number; // minor units
  currency?: string;
  lastRemindedDays?: number;
  href: string;
};

export type DemoClient = {
  name: string;
  company: string;
  email: string;
  contact: string;
  projects: string[];
};

export type DemoProject = {
  name: string;
  slug: string;
  client: string;
  stage: string;
  status: "active" | "completed" | "archived";
  progress: number;
  targetDate: string;
  nextMilestone: string;
  blocking?: string;
};

export const DEMO_ORG = {
  name: "Northline Studio",
  slug: "northline",
  accentColor: "231 48% 48%",
  currency: "GBP",
  website: "https://northline.studio",
};

export const DEMO_CLIENTS: DemoClient[] = [
  {
    name: "Sarah Whitfield",
    company: "Northstar Ltd",
    email: "sarah@northstar.co",
    contact: "Sarah Whitfield",
    projects: ["Northstar Website Redesign"],
  },
  {
    name: "James Okoro",
    company: "Bright Labs",
    email: "james@brightlabs.io",
    contact: "James Okoro",
    projects: ["Bright Labs Brand Refresh"],
  },
  {
    name: "Elena Ruiz",
    company: "Atlas Coffee",
    email: "elena@atlascoffee.com",
    contact: "Elena Ruiz",
    projects: ["Atlas Coffee Packaging"],
  },
];

export const DEMO_PROJECTS: DemoProject[] = [
  {
    name: "Northstar Website Redesign",
    slug: "northstar-website-redesign",
    client: "Northstar Ltd",
    stage: "Visual Design",
    status: "active",
    progress: 62,
    targetDate: "2026-09-30",
    nextMilestone: "Development",
    blocking: "Homepage Design approval",
  },
  {
    name: "Bright Labs Brand Refresh",
    slug: "bright-labs-brand-refresh",
    client: "Bright Labs",
    stage: "Logo Direction",
    status: "active",
    progress: 40,
    targetDate: "2026-10-15",
    nextMilestone: "Brand Guidelines",
    blocking: "Logo direction approval",
  },
  {
    name: "Atlas Coffee Packaging",
    slug: "atlas-coffee-packaging",
    client: "Atlas Coffee",
    stage: "Production Proof",
    status: "active",
    progress: 78,
    targetDate: "2026-09-12",
    nextMilestone: "Print Handoff",
    blocking: "Brand assets upload",
  },
];

export const DEMO_WAITING: DemoWaitingItem[] = [
  {
    id: "w1",
    client: "Sarah Whitfield",
    clientCompany: "Northstar Ltd",
    project: "Northstar Website Redesign",
    projectSlug: "northstar-website-redesign",
    type: "approval",
    title: "Homepage Design",
    detail: "Approval requested",
    daysWaiting: 4,
    href: "/demo/projects/northstar-website-redesign",
  },
  {
    id: "w2",
    client: "Elena Ruiz",
    clientCompany: "Atlas Coffee",
    project: "Atlas Coffee Packaging",
    projectSlug: "atlas-coffee-packaging",
    type: "file_request",
    title: "Brand Assets",
    detail: "3 files requested",
    daysWaiting: 5,
    href: "/demo/projects/atlas-coffee-packaging",
  },
  {
    id: "w3",
    client: "James Okoro",
    clientCompany: "Bright Labs",
    project: "Bright Labs Brand Refresh",
    projectSlug: "bright-labs-brand-refresh",
    type: "payment",
    title: "INV-108",
    detail: "Overdue 3 days",
    daysWaiting: 3,
    amount: 240000,
    currency: "GBP",
    lastRemindedDays: 2,
    href: "/demo/invoices/INV-108",
  },
  {
    id: "w4",
    client: "James Okoro",
    clientCompany: "Bright Labs",
    project: "Bright Labs Brand Refresh",
    projectSlug: "bright-labs-brand-refresh",
    type: "approval",
    title: "Logo Direction",
    detail: "Approval requested",
    daysWaiting: 6,
    href: "/demo/projects/bright-labs-brand-refresh",
  },
  {
    id: "w5",
    client: "Sarah Whitfield",
    clientCompany: "Northstar Ltd",
    project: "Northstar Website Redesign",
    projectSlug: "northstar-website-redesign",
    type: "payment",
    title: "INV-104",
    detail: "Overdue 8 days",
    daysWaiting: 8,
    amount: 602000,
    currency: "GBP",
    href: "/demo/invoices/INV-104",
  },
  {
    id: "w6",
    client: "Sarah Whitfield",
    clientCompany: "Northstar Ltd",
    project: "Northstar Website Redesign",
    projectSlug: "northstar-website-redesign",
    type: "task",
    title: "Homepage copy",
    detail: "Requested from client",
    daysWaiting: 2,
    href: "/demo/projects/northstar-website-redesign",
  },
  {
    id: "w7",
    client: "Elena Ruiz",
    clientCompany: "Atlas Coffee",
    project: "Atlas Coffee Packaging",
    projectSlug: "atlas-coffee-packaging",
    type: "reply",
    title: "Confirm launch date",
    detail: "Awaiting reply",
    daysWaiting: 3,
    href: "/demo/projects/atlas-coffee-packaging",
  },
];

export type DemoActivity = { actor: string; action: string; target: string; ago: string };

export const DEMO_ACTIVITY: DemoActivity[] = [
  { actor: "Sarah Whitfield", action: "approved", target: "Homepage Design v2", ago: "2h" },
  { actor: "System", action: "recorded payment for", target: "INV-104", ago: "5h" },
  { actor: "James Okoro", action: "uploaded", target: "brand-assets.zip", ago: "1d" },
  { actor: "Northline Studio", action: "uploaded", target: "Homepage Design v3", ago: "1d" },
  { actor: "Sarah Whitfield", action: "requested changes on", target: "Homepage Design v1", ago: "3d" },
];

export function waitingSummary(items: DemoWaitingItem[] = DEMO_WAITING) {
  const outstanding = items
    .filter((i) => i.type === "payment")
    .reduce((sum, i) => sum + (i.amount ?? 0), 0);
  return {
    count: items.length,
    outstanding, // minor units
    approvals: items.filter((i) => i.type === "approval").length,
    fileRequests: items.filter((i) => i.type === "file_request").length,
    replies: items.filter((i) => i.type === "reply").length,
    tasks: items.filter((i) => i.type === "task").length,
    payments: items.filter((i) => i.type === "payment").length,
  };
}

export const WAITING_TYPE_LABEL: Record<WaitingType, string> = {
  approval: "Approval",
  file_request: "Files",
  payment: "Payment",
  task: "Task",
  reply: "Reply",
};
