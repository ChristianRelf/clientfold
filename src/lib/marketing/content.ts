/**
 * Marketing copy as data. Audience pages (/for/[audience]) and campaign landing
 * pages (/lp/[slug]) render from these definitions with reusable components —
 * unique messaging, not hundreds of thin SEO pages. Only defined entries exist.
 */

export type AudiencePage = {
  slug: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  pains: string[];
  seoTitle: string;
  seoDescription: string;
};

export const AUDIENCES: Record<string, AudiencePage> = {
  "web-design-agencies": {
    slug: "web-design-agencies",
    eyebrow: "For web design agencies",
    headline: "Ship sites without the approval chaos.",
    subhead:
      "Track every design approval, keep client files in one place, and see which projects are blocked on the client — not on you.",
    pains: [
      "Approvals lost in email threads",
      "“Which version did they sign off?”",
      "Chasing content and logins before launch",
    ],
    seoTitle: "Client portal for web design agencies",
    seoDescription:
      "ClientFold gives web design agencies one portal for approvals, files, invoices and client updates.",
  },
  freelancers: {
    slug: "freelancers",
    eyebrow: "For freelancers",
    headline: "Your client process, minus the chasing.",
    subhead:
      "Keep approvals, files and invoices in one polished portal—and let Follow-up Autopilot send the reminders you never want to write.",
    pains: ["Clients who go quiet", "Approvals buried in email", "Following up on overdue invoices"],
    seoTitle: "Client portal for freelancers",
    seoDescription: "ClientFold gives freelancers one client portal for approvals, files and invoices, with polite follow-ups that send themselves.",
  },
  "design-studios": {
    slug: "design-studios",
    eyebrow: "For design studios",
    headline: "Your work is polished. Make the process match.",
    subhead: "Version-tracked approvals and a portal your clients actually enjoy using.",
    pains: ["Feedback scattered everywhere", "Version confusion", "A client experience that lets the work down"],
    seoTitle: "Client portal for design studios",
    seoDescription: "ClientFold gives design studios version-tracked approvals and a branded client portal.",
  },
  "marketing-agencies": {
    slug: "marketing-agencies",
    eyebrow: "For marketing agencies",
    headline: "Keep every client moving.",
    subhead: "See what's waiting on each client across every retainer and project, at a glance.",
    pains: ["Approvals across many clients", "Deliverables waiting on sign-off", "Reporting who's blocking what"],
    seoTitle: "Client portal for marketing agencies",
    seoDescription: "ClientFold helps marketing agencies track approvals and client actions across every account.",
  },
  consultants: {
    slug: "consultants",
    eyebrow: "For consultants",
    headline: "Give clients one clear place to look.",
    subhead: "Deliverables, decisions and invoices — organised, professional, and always up to date.",
    pains: ["Decisions buried in email", "Deliverables scattered", "Following up on invoices"],
    seoTitle: "Client portal for consultants",
    seoDescription: "ClientFold gives consultants a clean portal for deliverables, approvals and invoices.",
  },
};

export type CampaignPage = {
  slug: string;
  headline: string;
  subhead: string;
  cta: string;
  showcase: "waiting" | "approval" | "portal";
  signupContext?: string;
  eyebrow?: string;
  pains?: string[];
};

export const CAMPAIGNS: Record<string, CampaignPage> = {
  "stop-chasing-clients": {
    slug: "stop-chasing-clients",
    headline: "Stop chasing your clients.",
    subhead: "See every approval, file, payment and decision you're still waiting on.",
    cta: "Join the waitlist",
    showcase: "waiting",
    signupContext: "stop-chasing-clients",
  },
  "client-approvals": {
    slug: "client-approvals",
    headline: "“Looks good” isn't an approval process.",
    subhead: "Send work. Track versions. Get a clear approval.",
    cta: "Join the waitlist",
    showcase: "approval",
    signupContext: "client-approvals",
  },
  "client-portal": {
    slug: "client-portal",
    headline: "Give clients somewhere to look.",
    subhead: "Projects, files, approvals and invoices in one clean portal.",
    cta: "Join the waitlist",
    showcase: "portal",
    signupContext: "client-portal",
  },
};

// SEO landing pages that map to a campaign showcase.
export const SEO_LANDERS: Record<string, CampaignPage> = {
  "client-approval-software": {
    slug: "client-approval-software",
    headline: "Client approval software that ends the email thread.",
    subhead: "Request approvals, track versions, and keep an immutable record of every sign-off.",
    cta: "Join the waitlist",
    showcase: "approval",
  },
  "client-portal-for-agencies": {
    slug: "client-portal-for-agencies",
    eyebrow: "For agencies",
    headline: "A client portal built for agencies.",
    subhead: "Approvals, files, invoices and updates — one portal per client, on your brand.",
    cta: "Join the waitlist",
    showcase: "portal",
    pains: ["Approvals across too many threads", "Client files without a clear home", "Teams guessing what is blocked"],
  },
  "client-portal-for-freelancers": {
    slug: "client-portal-for-freelancers",
    eyebrow: "For freelancers",
    headline: "A client portal for freelancers.",
    subhead: "Look like a studio and stop chasing clients for approvals and payments.",
    cta: "Join the waitlist",
    showcase: "portal",
    pains: ["Clients who go quiet", "Approvals buried in email", "Following up on overdue invoices"],
  },
};
