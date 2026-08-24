export type SupportSection = {
  title: string;
  body: string[];
  steps?: string[];
  note?: string;
};

export type SupportArticle = {
  slug: string;
  title: string;
  summary: string;
  category: "Getting started" | "Client portal" | "Projects" | "Autopilot" | "Billing" | "Integrations";
  readTime: string;
  sections: SupportSection[];
};

export const supportArticles: SupportArticle[] = [
  {
    slug: "create-your-first-project",
    title: "Create your first client project",
    summary: "Set up the client, milestones and first action without overbuilding the workspace.",
    category: "Getting started",
    readTime: "4 min",
    sections: [
      { title: "Before you begin", body: ["Have the client’s name and email address, a short project title, and the first thing you need from them. You can add the rest later."], note: "Start with the next real client action-not a complete project plan. A focused portal is easier for clients to understand." },
      { title: "Create the project", body: ["From Projects, choose New project and enter the core details."], steps: ["Choose or create the client.", "Name the project in language the client will recognise.", "Set the target date and confirm the project currency.", "Add the first milestone or request, then save the project."] },
      { title: "Check before inviting", body: ["Preview the client portal and check the organisation name, accent colour, contact details and first action. The invitation opens directly to the project, so clients do not need a ClientFold account."], steps: ["Open the portal preview.", "Make sure the first request has a clear title and deadline.", "Send the invitation when the page reads clearly without extra context."] },
    ],
  },
  {
    slug: "invite-a-client",
    title: "Invite a client securely",
    summary: "Understand portal links, invitations and what your client sees when they arrive.",
    category: "Client portal",
    readTime: "3 min",
    sections: [
      { title: "How access works", body: ["Client invitations use a secure link tied to the intended portal. Clients can view the work you share with them without creating a password or joining your team workspace.", "Treat portal links like any other private client link. Send them only to the intended recipient and avoid forwarding them into public channels."] },
      { title: "Send an invitation", body: ["Open the project and choose Invite client."], steps: ["Confirm the client email address.", "Review the project name shown in the email.", "Send the invitation.", "Use the project activity to confirm when the client opens or acts on the request."] },
      { title: "If the link does not work", body: ["Ask the client to open the newest invitation. Older or expired links may no longer be valid. Confirm the email address, then resend access from the client record."], note: "Never ask a client to send you the full secure URL in a public support message." },
    ],
  },
  {
    slug: "request-and-review-files",
    title: "Request and review client files",
    summary: "Ask for exact assets, keep versions organised and return useful feedback.",
    category: "Projects",
    readTime: "5 min",
    sections: [
      { title: "Write a useful request", body: ["Use a title that names the asset and a description that explains acceptable formats, dimensions or examples. Split unrelated assets into separate requests so each one can be completed independently."], steps: ["Open the relevant project.", "Create a file request.", "Add accepted formats and any size guidance.", "Set a realistic due date and publish the request."] },
      { title: "Review an upload", body: ["When a client uploads a file, ClientFold attaches it to the request and records the activity. Download or preview it, then either mark the request complete or reply with the specific change needed."], note: "Keep feedback with the file request. This creates a cleaner project record than starting a separate email thread." },
      { title: "Replace and retain versions", body: ["A replacement upload should be added as a new version rather than overwriting the earlier file. Version history helps both sides understand which asset was reviewed and approved."] },
    ],
  },
  {
    slug: "approvals-and-feedback",
    title: "Send work for approval",
    summary: "Create a focused review, collect precise feedback and preserve the decision trail.",
    category: "Projects",
    readTime: "5 min",
    sections: [
      { title: "Prepare the review", body: ["Name the deliverable, explain the decision you need, and state what approval means for the next stage. Avoid combining several unrelated decisions in one approval."], steps: ["Open the project and add an approval.", "Attach the correct version.", "Add a short review brief and deadline.", "Preview the client view, then send."] },
      { title: "Handle requested changes", body: ["Comments and requested changes stay attached to the approval. Resolve each point, upload the revised version and ask for approval again. The earlier decision remains in the history."], note: "If the scope has changed rather than the work needing a correction, record that separately before producing a new version." },
      { title: "What the record includes", body: ["The project history records the version, decision, actor and time. Keep any contractually important sign-off requirements in your own agreement; ClientFold supports the record but does not replace legal advice."] },
    ],
  },
  {
    slug: "configure-autopilot-reminders",
    title: "Configure Autopilot reminders",
    summary: "Let ClientFold send considerate follow-ups while keeping manual control.",
    category: "Autopilot",
    readTime: "4 min",
    sections: [
      { title: "The default rhythm", body: ["Autopilot sends a polite reminder after three days and a final reminder after seven days, on weekdays only. The sequence stops as soon as the client completes the requested action."], note: "Autopilot is designed for active project requests, not marketing or unsolicited messages." },
      { title: "Turn Autopilot on or off", body: ["Open the waiting item and use its Autopilot control."], steps: ["Check the recipient and action title.", "Enable Autopilot for routine follow-up.", "Pause it when the situation needs a personal conversation.", "Use Send reminder for a one-off manual nudge."] },
      { title: "Why a reminder did not send", body: ["Check whether the client already acted, the item was paused, the reminder date fell on a weekend, or the recipient email needs correcting. The activity history shows completed and attempted steps."] },
    ],
  },
  {
    slug: "create-and-track-invoices",
    title: "Create and track an invoice",
    summary: "Keep payment status beside the project and take payment through Stripe.",
    category: "Billing",
    readTime: "5 min",
    sections: [
      { title: "Connect payments", body: ["Connect a Stripe account from Settings → Integrations before taking online payment. Stripe handles card details and payout onboarding; ClientFold stores payment status and transaction references, not card numbers."] },
      { title: "Create the invoice", body: ["Open the project or Invoices and choose New invoice."], steps: ["Confirm the client and billing email.", "Add clear line items, tax treatment and due date.", "Review the currency and total.", "Send the invoice to the client portal."] },
      { title: "Track and reconcile", body: ["Verified Stripe events update the invoice status after payment. If a payment appears in Stripe but not ClientFold, wait briefly, refresh the invoice, and then contact support with the invoice number-never a full card number."] },
    ],
  },
  {
    slug: "import-marketplace-projects",
    title: "Import marketplace projects safely",
    summary: "Bring in useful project metadata without moving protected marketplace activity.",
    category: "Integrations",
    readTime: "6 min",
    sections: [
      { title: "What an import does", body: ["ClientFold can map project, buyer, status, date and earnings metadata from a file you provide. Imports are staged for review before they create or change project records.", "Marketplace messaging, delivery, disputes and payment remain on the original marketplace unless an approved integration explicitly says otherwise."] },
      { title: "Import a CSV", body: ["Open Settings → Integrations and choose the marketplace or CSV import."], steps: ["Export a CSV from the source service.", "Upload it to the reviewed importer.", "Confirm the suggested column mapping.", "Review every staged row and resolve duplicates.", "Apply the approved rows to your workspace."] },
      { title: "Keep marketplace boundaries clear", body: ["Do not upload private browser data, session cookies or scraped content. ClientFold does not automate bids, proposals or marketplace messages and does not use private endpoints."], note: "The source marketplace remains the system of record for its contracts, communication and payments." },
    ],
  },
  {
    slug: "manage-your-subscription",
    title: "Manage, cancel or refund a subscription",
    summary: "Change plans, stop renewal and understand when a refund may be available.",
    category: "Billing",
    readTime: "4 min",
    sections: [
      { title: "Change or cancel", body: ["Open Settings → Billing to see the current plan and renewal date. Cancellation stops the next renewal and paid access normally continues until the end of the billing period."], steps: ["Open Billing settings.", "Choose Manage subscription.", "Confirm the change or cancellation in the billing portal.", "Save a copy of the confirmation for your records."] },
      { title: "Request a refund", body: ["Read the Refund Policy for the current eligibility rules. If you believe there was a duplicate charge, billing error, unauthorised payment or material service failure, contact billing@useclientfold.com with the account email and invoice reference."], note: "Do not send card numbers, security codes or bank-login details." },
      { title: "Export before access ends", body: ["Export important project records and download files before the end of the retention window. Closing an account does not automatically cancel amounts already due for completed billing periods."] },
    ],
  },
];

export const supportCategories = ["Getting started", "Client portal", "Projects", "Autopilot", "Billing", "Integrations"] as const;

export function getSupportArticle(slug: string) {
  return supportArticles.find((article) => article.slug === slug);
}
