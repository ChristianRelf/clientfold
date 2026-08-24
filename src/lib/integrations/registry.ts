export const INTEGRATION_CATEGORIES = [
  "marketplace",
  "payments",
  "storage",
  "communication",
  "developer",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];
export type IntegrationProvider =
  | "fiverr"
  | "freelancer"
  | "upwork"
  | "contra"
  | "generic"
  | "stripe"
  | "google_drive"
  | "dropbox"
  | "slack"
  | "discord"
  | "webhook";
export type IntegrationCapability = "Import" | "Payments" | "Storage" | "Notifications" | "Developer";
export type IntegrationAvailability = "available" | "import_only" | "approval_required" | "coming_soon";

export type IntegrationDefinition = {
  provider: IntegrationProvider;
  name: string;
  category: IntegrationCategory;
  description: string;
  logoPath?: string;
  brandAssetMode: "logo" | "text";
  availability: IntegrationAvailability;
  capabilities: IntegrationCapability[];
  detailPath: string;
  does: string[];
  reads: string[];
  never: string[];
  policyNote?: string;
};

export const integrationRegistry: IntegrationDefinition[] = [
  {
    provider: "fiverr", name: "Fiverr", category: "marketplace",
    description: "Bring Fiverr orders, deadlines and earnings into one private work view.",
    logoPath: "/integrations/fiverr.svg", brandAssetMode: "logo", availability: "import_only",
    capabilities: ["Import"], detailPath: "/settings/integrations/fiverr",
    does: ["Imports metadata from your CSV exports", "Stages forwarded order notifications for review", "Links every imported project back to Fiverr"],
    reads: ["Order identifiers and titles", "Buyer handles", "Statuses, dates, milestones and earnings metadata"],
    never: ["Copies conversations or delivery files", "Sends messages to Fiverr buyers", "Moves contracts or payments away from Fiverr"],
    policyNote: "Fiverr-managed communication, delivery, disputes and payment stay on Fiverr.",
  },
  {
    provider: "freelancer", name: "Freelancer.com", category: "marketplace",
    description: "Import Freelancer.com project metadata now; OAuth sync is under review.",
    logoPath: "/integrations/freelancer.svg", brandAssetMode: "logo", availability: "import_only",
    capabilities: ["Import"], detailPath: "/settings/integrations/freelancer",
    does: ["Imports projects with the universal CSV mapper", "Keeps source links alongside ClientFold projects", "Prepares for an approved read-only API connection"],
    reads: ["Project identifiers and titles", "Client handles", "Statuses, dates, milestones and earnings metadata"],
    never: ["Submits bids", "Sends marketplace messages", "Releases milestone payments"],
    policyNote: "OAuth remains disabled until Freelancer.com storage and retention requirements are cleared.",
  },
  {
    provider: "upwork", name: "Upwork", category: "marketplace",
    description: "Use reviewed file imports while commercial API access remains unavailable.",
    logoPath: "/integrations/upwork.svg", brandAssetMode: "logo", availability: "approval_required",
    capabilities: ["Import"], detailPath: "/settings/integrations/upwork",
    does: ["Imports user-provided metadata with the universal mapper", "Labels projects as Upwork-managed", "Preserves a link to the source engagement"],
    reads: ["Only metadata you explicitly upload or enter"],
    never: ["Uses browser cookies or private endpoints", "Automates proposals", "Claims unsupported commercial API access"],
    policyNote: "Upwork currently describes API access as personal/internal only. ClientFold does not offer OAuth without a commercial agreement.",
  },
  {
    provider: "contra", name: "Contra", category: "marketplace",
    description: "Import project metadata while hosted OAuth and MCP terms are evaluated.",
    logoPath: "/integrations/contra.svg", brandAssetMode: "logo", availability: "import_only",
    capabilities: ["Import"], detailPath: "/settings/integrations/contra",
    does: ["Imports metadata with the universal mapper", "Keeps Contra as the engagement system of record", "Prepares for a future approved connection"],
    reads: ["Project, client, date and earnings metadata you provide"],
    never: ["Sends proposals or invoices", "Copies chats", "Calls hosted MCP without authorization"],
    policyNote: "Hosted OAuth/MCP sync remains disabled until commercial storage permission is confirmed.",
  },
  {
    provider: "generic", name: "CSV import", category: "marketplace",
    description: "Map a CSV export from any freelance marketplace into ClientFold.",
    brandAssetMode: "text", availability: "available", capabilities: ["Import"], detailPath: "/settings/integrations/generic",
    does: ["Maps common CSV columns", "Stages every row for review", "Saves normalized metadata only"],
    reads: ["The CSV file you select"], never: ["Uploads data before you submit", "Applies changes without review", "Runs spreadsheet formulae"],
  },
  {
    provider: "stripe", name: "Stripe", category: "payments",
    description: "Take ClientFold invoice payments through your connected Stripe account.",
    logoPath: "/integrations/stripe.svg", brandAssetMode: "logo", availability: "available",
    capabilities: ["Payments"], detailPath: "/settings/integrations/stripe",
    does: ["Connects your Stripe account", "Creates checkout for ClientFold invoices", "Updates invoice status from verified webhooks"],
    reads: ["Connected account status", "Payment confirmation metadata"], never: ["Stores card numbers", "Redirects marketplace payments", "Controls Stripe payouts"],
  },
  {
    provider: "google_drive", name: "Google Drive", category: "storage",
    description: "Keep shared project files in Google Drive.", logoPath: "/integrations/google-drive.svg",
    brandAssetMode: "logo", availability: "coming_soon", capabilities: ["Storage"], detailPath: "/settings/integrations/google_drive",
    does: ["Will link project folders and files"], reads: ["Only folders selected during setup"], never: ["Scans an entire Drive by default"],
  },
  {
    provider: "dropbox", name: "Dropbox", category: "storage",
    description: "Connect Dropbox folders to ClientFold projects.", logoPath: "/integrations/dropbox.svg",
    brandAssetMode: "logo", availability: "coming_soon", capabilities: ["Storage"], detailPath: "/settings/integrations/dropbox",
    does: ["Will link selected folders and files"], reads: ["Only content authorized during setup"], never: ["Moves or deletes source files automatically"],
  },
  {
    provider: "slack", name: "Slack", category: "communication",
    description: "Send project and client-action notifications to Slack.", logoPath: "/integrations/slack.svg",
    brandAssetMode: "logo", availability: "coming_soon", capabilities: ["Notifications"], detailPath: "/settings/integrations/slack",
    does: ["Will post selected workspace notifications"], reads: ["Connection and selected channel metadata"], never: ["Imports channel history"],
  },
  {
    provider: "discord", name: "Discord", category: "communication",
    description: "Send lightweight project notifications to Discord.", logoPath: "/integrations/discord.svg",
    brandAssetMode: "logo", availability: "coming_soon", capabilities: ["Notifications"], detailPath: "/settings/integrations/discord",
    does: ["Will deliver selected webhook notifications"], reads: ["Webhook destination metadata"], never: ["Reads server message history"],
  },
  {
    provider: "webhook", name: "Webhooks", category: "developer",
    description: "Send signed ClientFold events to your own systems.", brandAssetMode: "text",
    availability: "available", capabilities: ["Developer", "Notifications"], detailPath: "/settings/integrations/webhook",
    does: ["Delivers selected events with an HMAC signature", "Retries transient failures with backoff", "Records status and response metadata for every attempt"],
    reads: ["Only events selected during setup", "Sanitized event metadata from the product event pipeline"],
    never: ["Sends file bodies, client messages or approval comments", "Connects to private network addresses", "Follows endpoint redirects"],
  },
];

export const integrationByProvider = new Map(integrationRegistry.map((definition) => [definition.provider, definition]));

export function getIntegration(provider: string): IntegrationDefinition | undefined {
  return integrationByProvider.get(provider as IntegrationProvider);
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  marketplace: "Marketplaces", payments: "Payments", storage: "Storage", communication: "Communication", developer: "Developer",
};
