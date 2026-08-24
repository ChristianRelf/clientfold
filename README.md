# ClientFold

The client portal for freelancers, studios, consultants and agencies.
**Stop chasing your clients.** Everything your client needs. Nothing they don't.

This repository is a **running, production-oriented foundation** - real Next.js
app, real database, real multi-tenant auth, the signature Waiting Room, a
marketing site, an interactive demo, and the growth/attribution stack. It is
deliberately built as a coherent core to grow outward from, not a throwaway
mockup. See **[Status](#status)** for exactly what is implemented vs. scaffolded.

## Stack

- **Next.js 15** (App Router, React 19, Server Components + Server Actions)
- **TypeScript**, strict
- **Tailwind CSS** design system (restrained, Linear/Vercel/Stripe-adjacent)
- **Prisma** ORM - SQLite locally for zero-infra runnability, one-line switch to Postgres
- **Zod** validation
- Zero-dependency auth crypto (scrypt password hashing, HMAC-signed sessions)

## Plugins & integrations

`/settings/integrations` is the signed-in connector catalogue. It includes provider detail
pages, locally stored brand assets, Stripe Connect setup, and reviewed marketplace
imports for Fiverr, Freelancer.com, Upwork, Contra, and generic CSV data. Imports
stage metadata for per-item review and keep marketplace earnings separate from
ClientFold invoices. Marketplace-origin projects do not expose ClientFold portal,
messaging, or reminder flows.

Fiverr notification forwarding uses Resend Receiving. Configure
`INBOUND_EMAIL_DOMAIN`, `RESEND_API_KEY`, and `RESEND_WEBHOOK_SECRET`, then point
the Resend `email.received` webhook at `/api/integrations/email/received`. The
handler verifies signatures and replay windows, retrieves content only long enough
to normalize allowed metadata, and does not persist raw email or attachments.

New waitlist entries can also notify a Discord channel. Create an incoming
webhook for the destination channel and set `DISCORD_WAITLIST_WEBHOOK_URL` in the
runtime environment. The signup is saved before notification delivery, so a
temporary Discord failure does not lose the entry.

## Quick start

```bash
pnpm install
cp .env.example .env            # already present after first setup
pnpm exec prisma generate
pnpm exec prisma db push        # creates prisma/dev.db (SQLite)
pnpm db:seed                    # loads the Northline Studio demo dataset
pnpm dev                        # http://localhost:3000
```

## Docker and HTTPS

The Compose stack includes Caddy in front of ClientFold. Caddy listens publicly
on ports 80 and 443, redirects HTTP to HTTPS, and obtains and renews the TLS
certificate for `useclientfold.com` automatically. The app port remains bound to
the host loopback interface for local diagnostics only.

Before starting production, point the domain's A and/or AAAA record to the
server, allow inbound TCP ports 80 and 443 and UDP port 443, and set at least:

```bash
APP_URL=https://useclientfold.com
SITE_DOMAIN=useclientfold.com
ACME_EMAIL=hello@useclientfold.com
AUTH_SECRET=replace-with-a-long-random-secret
```

Then build and run the stack with persistent SQLite data, uploads, and Caddy
certificate state:

```bash
docker compose up --build
```

Open `https://useclientfold.com`. Local diagnostics remain available at
`http://127.0.0.1:3000`. To load (or reset) the Northline Studio demo data on
startup, run:

```bash
SEED_DATABASE=true docker compose up --build
```

On PowerShell, use `$env:SEED_DATABASE="true"` before `docker compose up --build`.
The database and uploaded files live in the `clientfold_data` and
`clientfold_uploads` named volumes. Caddy certificates and state live in the
`caddy_data` and `caddy_config` volumes. Set `CLIENTFOLD_PORT` to use a different
loopback diagnostics port, and replace `AUTH_SECRET` before exposing the stack.

**Demo logins** (seeded):

| Account | Email | Password | Access |
| --- | --- | --- | --- |
| Owner | `demo@useclientfold.com` | `clientfold` | Northline Studio workspace |
| Internal | `growth@useclientfold.com` | `clientfold` | `/internal/growth` dashboard |

## Where to look

| Surface | Route | Notes |
| --- | --- | --- |
| Marketing homepage | `/` | Hero + live Waiting Room + product sections |
| Interactive demo | `/demo` | Northline data, read-only |
| Campaign landing | `/lp/stop-chasing-clients` | Dynamic campaign messaging |
| Audience pages | `/for/freelancers` … | SEO metadata per audience |
| **Waiting Room** | `/waiting` | Signature surface - DB-backed, tenant-scoped |
| Home dashboard | `/home` | Needs-attention, waiting preview, activity |
| Project workspace | `/projects/[slug]` | Blocking action + milestone timeline |
| Growth dashboard | `/internal/growth` | Internal-only funnel + attribution |

## Architecture notes

- **Multi-tenancy** (`src/lib/tenancy.ts`): every tenant-scoped query resolves a
  verified `OrganisationMember` server-side. Organisation IDs are never trusted
  from the client; project lookups are `findFirst({ slug, organisationId })` so a
  wrong tenant returns 404 (IDOR-safe).
- **Project health** (`src/lib/health.ts`) is derived from real state with an
  explanation - never a meaningless score.
- **Attribution** (`src/lib/marketing/attribution.ts`): first-party visitor id,
  first-touch preserved on signup, latest-touch refreshed, consent-gated.
- **Marketing events** (`src/lib/marketing/events.ts`): a fixed taxonomy with a
  metadata allow-list so client-confidential content never reaches analytics.
- **Experiments** (`src/lib/marketing/experiments.ts`): deterministic per-visitor
  bucketing, exposure/conversion recorded, no SEO cloaking.
- **Stripe webhook** (`src/app/api/stripe/webhook/route.ts`): manual signature
  verification with replay protection; marks invoices paid + resolves Waiting.

## Switching to Postgres

The schema avoids provider-specific features so the move is small:

1. `datasource db { provider = "postgresql" }` in `prisma/schema.prisma`.
2. Point `DATABASE_URL` at your Postgres instance.
3. `pnpm exec prisma migrate dev`.

("Enum" columns are documented `String`s and JSON payloads are `String` for
portability - no schema changes required.)

## Status

**Implemented and running:** auth (password + sessions), multi-tenant orgs,
clients, projects, milestones, project health, the Waiting Room, home dashboard,
project workspace, invoices list, files/inbox/settings, marketing site (home,
features, pricing, audiences, campaigns, SEO landers, customers), interactive
demo, SEO (robots/sitemap/OG image/metadata), attribution, marketing-event
ingestion, consent management, experiment framework, referral + growth schema,
internal growth dashboard, Stripe webhook verification, seed data.

Also implemented: the **client portal** (`/portal/*`, mobile-first) with
**magic-link auth** (`/invite/[token]`, self-serve `/portal/enter`), the
**approval loop** (approve / request-changes writing an immutable
`ApprovalResponse` and resolving the matching Waiting item), **file
uploads to object storage** - a provider abstraction (local filesystem for dev,
S3-compatible via dependency-free SigV4 presigned URLs for prod) with
signed-URL downloads and session-checked access on both sides - and **Stripe
Connect invoice payments**: clients pay from the portal through the org's
connected account (real Stripe Checkout via REST, with a local dev simulation
when no keys are set), the webhook + a shared idempotent `markInvoicePaid`
mark the invoice paid and clear the Waiting Room, and Settings has a Connect
onboarding button.

The **reminder system** is also live: one-click "Remind" from the Waiting Room
emails the client a fresh magic link, records reminder history, and enforces a
24-hour anti-spam cooldown per item (email goes through the Resend abstraction;
in dev it's recorded without sending).

The agency **"invite client" flow** is live too: from the Clients page you can
add a client, optionally assign them to a project, and send the portal magic
link - tenant-scoped, with activity + a `client.invited` event. And **two-way
messaging** now works both ways: clients message from the portal, staff reply
from the inbox thread view, each tenant-scoped with activity events.

The **project-creation wizard** is now the full four-step flow (Details →
Milestones → Invite client → Review), creating the project, its milestones, the
client link, and an optional invitation in one atomic action. And **contextual
file feedback** is live: click a design image to drop a numbered pin and
comment, with threaded replies and resolve - shared between the client portal
and the agency, both served through signed URLs.

**Plan-subscription checkout** is live: upgrade or cancel an org's plan from
Settings → Billing, through Stripe subscription Checkout (with a local dev
simulation), applied identically by the webhook and the simulation.

**Message read-state** is now live: every message tracks who has read it
(type-prefixed viewer keys in `readBy`), so the inbox shows per-thread unread
counts with an unread dot and a sidebar badge, and the client portal badges the
Messages tab. Opening a conversation marks it read for that viewer, clearing the
badge - verified end-to-end in the browser on the agency side.

**Message email notifications** are now live: when a client sends a message from
the portal, org owners and admins are emailed a preview with a direct inbox link.
When staff reply from the inbox, the project's client contacts receive a preview
with a portal link. Both paths are best-effort (via the Resend abstraction) and
never block the send action.

The next workflow layer is live as well: the authenticated reminder worker runs
the automatic day-3/day-7 schedule; PDFs render in-browser with page-specific
comment threads; agency and portal messages accept up to five validated file
attachments; workspace @mentions create in-app notifications; and consent-gated
server-side conversions can be forwarded to Meta, Google Ads, or a signed custom
webhook.

The collaboration and growth surfaces now also include team invitations with
role controls, a notification centre, command search, organisation referral
tracking, and the reviewed marketplace-import catalogue described above.

**Next:** replace the reviewed import paths with approved provider OAuth/API
connections as commercial access permits, add native Drive/Dropbox storage
connections, and ship signed outbound product webhooks.

> Demo figures (e.g. "£8,420 outstanding") are **sample data** and must never be
> presented as real customer metrics.
