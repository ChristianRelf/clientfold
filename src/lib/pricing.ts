/** Pricing is configuration, not hard-coded UI. Amounts in whole GBP / month. */

export type Plan = {
  key: "free" | "solo" | "studio" | "agency";
  name: string;
  price: number;
  cadence: string;
  tagline: string;
  featured?: boolean;
  cta: string;
  limits: {
    activeProjects: number | "unlimited";
    clients: number | "unlimited";
    members: number | "unlimited";
    storageGb: number;
  };
  features: string[];
};

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    tagline: "Try it with one client.",
    cta: "Join the waitlist",
    limits: { activeProjects: 1, clients: 2, members: 1, storageGb: 1 },
    features: ["1 active project", "2 clients", "1 user", "1 GB storage", "ClientFold branding"],
  },
  {
    key: "solo",
    name: "Solo",
    price: 12,
    cadence: "/mo",
    tagline: "For freelancers who bill clients.",
    cta: "Join the waitlist",
    limits: { activeProjects: 10, clients: "unlimited", members: 1, storageGb: 25 },
    features: [
      "10 active projects",
      "Unlimited clients",
      "25 GB storage",
      "Custom branding",
      "Invoices & approvals",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    price: 29,
    cadence: "/mo",
    tagline: "For small teams and studios.",
    featured: true,
    cta: "Join the waitlist",
    limits: { activeProjects: "unlimited", clients: "unlimited", members: 5, storageGb: 100 },
    features: [
      "Unlimited projects",
      "5 members",
      "100 GB storage",
      "Custom domain",
      "Permissions",
      "Automatic reminders",
    ],
  },
  {
    key: "agency",
    name: "Agency",
    price: 69,
    cadence: "/mo",
    tagline: "For agencies running many clients.",
    cta: "Join the waitlist",
    limits: { activeProjects: "unlimited", clients: "unlimited", members: 15, storageGb: 500 },
    features: [
      "15 members",
      "500 GB storage",
      "White-label",
      "Audit history",
      "Advanced integrations",
    ],
  },
];

export function getPlan(key: string): Plan | undefined {
  return PLANS.find((p) => p.key === key);
}
