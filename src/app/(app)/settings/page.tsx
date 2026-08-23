import { getAppContext } from "@/lib/app";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { getPlan } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectStripeAction } from "./actions";
import Link from "next/link";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const SECTIONS = ["General", "Branding", "Members", "Billing", "Notifications", "Integrations", "Client Portal"];

export default async function SettingsPage() {
  const ctx = await getAppContext();
  const org = await db.organisation.findUnique({
    where: { id: ctx.org.id },
    include: { members: { include: { user: true } }, _count: { select: { projects: true, clients: true } } },
  });
  if (!org) return null;
  const plan = getPlan(org.plan);

  return (
    <div>
      <PageHeader title="Settings" description="Organisation and workspace configuration." />
      <div className="grid gap-6 p-6 lg:grid-cols-[180px_1fr]">
        <nav className="space-y-0.5">
          {SECTIONS.map((s, i) => s === "Notifications" ? (
            <Link key={s} href="/settings/notifications" className="block rounded-md px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground">{s}</Link>
          ) : (
            <span
              key={s}
              className={
                i === 0
                  ? "block rounded-md bg-muted px-3 py-1.5 text-[13px] font-medium"
                  : "block rounded-md px-3 py-1.5 text-[13px] text-muted-foreground"
              }
            >
              {s}
            </span>
          ))}
        </nav>

        <div className="max-w-xl space-y-4">
          <Row label="Organisation name" value={org.name} />
          <Row label="Slug" value={org.slug} />
          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <span className="text-[13px] text-muted-foreground">Plan</span>
            <span className="flex items-center gap-3">
              <span className="text-[13px] font-medium">{plan?.name ?? org.plan}</span>
              <a href="/settings/billing" className="text-2xs font-medium text-accent hover:underline">
                Manage billing
              </a>
            </span>
          </div>
          <Row label="Currency" value={org.currency} />
          <Row label="Timezone" value={org.timezone} />
          <Row label="Members" value={String(org.members.length)} />
          <Row label="Projects" value={String(org._count.projects)} />
          <Row label="Clients" value={String(org._count.clients)} />
          <Row
            label="Portal branding"
            value={org.removeBranding ? "ClientFold branding removed" : "Powered by ClientFold"}
          />
          <Row label="Custom domain" value={org.customDomain ?? "Not configured"} />
          <Row label="Referral link" value={`clientfold.com/waitlist?ref=${org.referralCode.slice(0, 8)}`} mono />

          {/* Payments — Stripe Connect */}
          <div className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium">Payments</div>
                <div className="mt-0.5 text-2xs text-muted-foreground">
                  Take invoice payments through your own Stripe account.
                </div>
              </div>
              {org.stripeConnectComplete ? (
                <Badge tone="success">Connected</Badge>
              ) : (
                <Badge tone="neutral">Not connected</Badge>
              )}
            </div>
            {!org.stripeConnectComplete ? (
              <form action={connectStripeAction} className="mt-3">
                <Button size="sm">Connect Stripe</Button>
              </form>
            ) : (
              <p className="mt-3 text-2xs text-muted-foreground">
                Payouts go directly to your connected account. Clients can pay invoices from their portal.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-[13px]" : "text-[13px] font-medium"}>{value}</span>
    </div>
  );
}
