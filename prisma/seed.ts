import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes, createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  DEMO_ORG,
  DEMO_CLIENTS,
  DEMO_PROJECTS,
  DEMO_WAITING,
  DEMO_ACTIVITY,
} from "../src/lib/demo/data";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

async function main() {
  console.log("Resetting demo data…");
  // Idempotent: clear the demo org if it exists.
  const existing = await db.organisation.findUnique({ where: { slug: DEMO_ORG.slug } });
  if (existing) {
    await db.organisation.delete({ where: { id: existing.id } });
  }

  // Owner + internal growth user.
  const owner = await db.user.upsert({
    where: { email: "demo@clientfold.com" },
    update: {},
    create: {
      email: "demo@clientfold.com",
      name: "Alex Morgan",
      passwordHash: hashPassword("clientfold"),
      emailVerified: new Date(),
    },
  });

  await db.user.upsert({
    where: { email: "growth@clientfold.com" },
    update: { isInternal: true },
    create: {
      email: "growth@clientfold.com",
      name: "Growth Admin",
      passwordHash: hashPassword("clientfold"),
      isInternal: true,
      emailVerified: new Date(),
    },
  });

  const org = await db.organisation.create({
    data: {
      name: DEMO_ORG.name,
      slug: DEMO_ORG.slug,
      accentColor: DEMO_ORG.accentColor,
      currency: DEMO_ORG.currency,
      website: DEMO_ORG.website,
      plan: "studio",
      activatedAt: daysAgo(30),
      members: { create: { userId: owner.id, role: "owner" } },
      subscription: { create: { plan: "studio", status: "active", attributionSource: "meta" } },
    },
  });

  // Clients.
  const clientBySlug = new Map<string, string>();
  for (const c of DEMO_CLIENTS) {
    const client = await db.client.create({
      data: {
        organisationId: org.id,
        name: c.name,
        email: c.email,
        company: c.company,
        status: "active",
        lastActiveAt: daysAgo(2),
        contacts: { create: { name: c.contact, email: c.email, isPrimary: true } },
      },
    });
    clientBySlug.set(c.company, client.id);
  }

  // Projects + one milestone timeline each.
  const projectBySlug = new Map<string, string>();
  for (const p of DEMO_PROJECTS) {
    const clientId = clientBySlug.get(p.client);
    const project = await db.project.create({
      data: {
        organisationId: org.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        health: p.status === "active" ? "waiting_on_client" : "on_track",
        healthReason: p.blocking ? `Waiting on client: ${p.blocking}.` : undefined,
        progress: p.progress,
        startDate: daysAgo(40),
        targetDate: new Date(p.targetDate),
        clients: clientId ? { create: { clientId } } : undefined,
        members: { create: { userId: owner.id, role: "owner" } },
        milestones: {
          create: [
            { title: "Discovery", status: "complete", order: 1, completedAt: daysAgo(35) },
            { title: "Wireframes", status: "complete", order: 2, completedAt: daysAgo(20) },
            { title: "Visual Design", status: "in_progress", order: 3 },
            { title: "Development", status: "upcoming", order: 4, startDate: daysAgo(-2) },
            { title: "Launch", status: "upcoming", order: 5 },
          ],
        },
      },
    });
    projectBySlug.set(p.name, project.id);
  }

  // A flagship approval with versions on the Northstar project.
  const northstar = projectBySlug.get("Northstar Website Redesign")!;
  const approval = await db.approval.create({
    data: {
      projectId: northstar,
      title: "Homepage Design",
      type: "design",
      status: "awaiting_approval",
      requestedFromClientId: clientBySlug.get("Northstar Ltd"),
      requestedAt: daysAgo(4),
      deadline: daysAgo(-2),
      versions: {
        create: [
          { version: 1, status: "changes_requested", notes: "Initial concepts", createdAt: daysAgo(9) },
          { version: 2, status: "changes_requested", notes: "Refined hero", createdAt: daysAgo(6) },
          { version: 3, status: "awaiting_approval", notes: "Addressed feedback", createdAt: daysAgo(1) },
        ],
      },
    },
    include: { versions: true },
  });

  // Immutable response history for v1/v2.
  for (const v of approval.versions.filter((x) => x.status === "changes_requested")) {
    await db.approvalResponse.create({
      data: {
        approvalId: approval.id,
        versionId: v.id,
        decision: "changes_requested",
        comment: "Can we make the headline bolder?",
        actorType: "client",
        actorId: clientBySlug.get("Northstar Ltd")!,
        actorName: "Sarah Whitfield",
        createdAt: v.createdAt,
      },
    });
  }

  // File request the client can fulfil in the portal, with a matching Waiting
  // item so completing it clears the agency Waiting Room.
  const northstarFileRequest = await db.fileRequest.create({
    data: {
      projectId: northstar,
      title: "Homepage Assets",
      instructions: "Please upload the following so we can finalise the design.",
      requestedItems: JSON.stringify(["Logo (SVG)", "Brand guidelines (PDF)", "Product imagery"]),
      status: "pending",
      requestedFromClientId: clientBySlug.get("Northstar Ltd"),
      createdAt: daysAgo(3),
    },
  });
  await db.waitingItem.create({
    data: {
      organisationId: org.id,
      clientId: clientBySlug.get("Northstar Ltd"),
      projectId: northstar,
      type: "file_request",
      title: northstarFileRequest.title,
      sourceType: "file_request",
      sourceId: northstarFileRequest.id,
      status: "waiting",
      requestedAt: daysAgo(3),
    },
  });

  // A short client-facing conversation. readBy uses the same type-prefixed
  // viewer keys as src/lib/message-reads.ts ("u:" staff, "c:" client), so the
  // demo opens with exactly one unread on each side: the client's reply is
  // unread for the agency, the team's message is unread for the client.
  const staffKey = `u:${owner.id}`;
  const clientKey = `c:${clientBySlug.get("Northstar Ltd")}`;
  await db.messageThread.create({
    data: {
      organisationId: org.id,
      projectId: northstar,
      subject: "Website Redesign",
      messages: {
        create: [
          { body: "Homepage Concepts v3 uploaded.", authorType: "system", authorName: "System", isSystem: true, createdAt: daysAgo(1), readBy: JSON.stringify([staffKey, clientKey]) },
          { body: "Here's the updated homepage — let us know what you think!", authorType: "user", authorName: "Alex Morgan", authorId: owner.id, createdAt: daysAgo(1), readBy: JSON.stringify([staffKey]) },
          { body: "Looks great, reviewing with the team today.", authorType: "client", authorName: "Sarah Whitfield", authorId: clientBySlug.get("Northstar Ltd"), createdAt: daysAgo(0), readBy: JSON.stringify([clientKey]) },
        ],
      },
    },
  });

  // A shared design image (SVG) the client can annotate, with seed feedback.
  const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#f6f7f9"/>
    <rect width="800" height="70" fill="#0c0e12"/>
    <text x="32" y="44" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700">Northstar</text>
    <text x="40" y="200" fill="#0c0e12" font-family="sans-serif" font-size="46" font-weight="700">Build with confidence.</text>
    <text x="40" y="240" fill="#5b6472" font-family="sans-serif" font-size="20">A homepage that converts.</text>
    <rect x="40" y="270" width="180" height="48" rx="8" fill="#3b46c4"/>
    <text x="70" y="300" fill="#fff" font-family="sans-serif" font-size="18" font-weight="600">Get started</text>
    <rect x="460" y="120" width="300" height="300" rx="12" fill="#e6e8ee"/>
  </svg>`;
  const designKey = `org/${org.id}/seed-homepage-design-v3.svg`;
  const designFull = join(process.cwd(), ".storage", designKey);
  mkdirSync(dirname(designFull), { recursive: true });
  writeFileSync(designFull, mockSvg);
  writeFileSync(`${designFull}.meta`, "image/svg+xml");
  const designFile = await db.file.create({
    data: {
      organisationId: org.id,
      projectId: northstar,
      name: "Homepage Design v3.svg",
      mimeType: "image/svg+xml",
      size: Buffer.byteLength(mockSvg),
      storageKey: designKey,
      relatedType: "approval",
      uploaderType: "user",
      uploaderId: owner.id,
      versions: { create: { version: 1, storageKey: designKey, size: Buffer.byteLength(mockSvg) } },
    },
  });
  const pinnedComment = await db.fileComment.create({
    data: {
      fileId: designFile.id,
      authorType: "user",
      authorId: owner.id,
      authorName: "Alex Morgan",
      body: "Made the hero headline bolder here — does this land for you?",
      x: 0.28,
      y: 0.38,
    },
  });
  await db.fileComment.create({
    data: {
      fileId: designFile.id,
      parentId: pinnedComment.id,
      authorType: "client",
      authorId: clientBySlug.get("Northstar Ltd"),
      authorName: "Sarah Whitfield",
      body: "Yes! Maybe a touch more breathing room above it.",
    },
  });

  // A magic-link invitation for Sarah so the portal flow is testable.
  const inviteToken = randomBytes(32).toString("base64url");
  await db.invitation.create({
    data: {
      organisationId: org.id,
      clientId: clientBySlug.get("Northstar Ltd"),
      email: "sarah@northstar.co",
      role: "client",
      tokenHash: createHash("sha256").update(inviteToken).digest("hex"),
      status: "pending",
      expiresAt: new Date(Date.now() + 14 * 86_400_000),
    },
  });
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  // Invoices referenced by waiting payment items.
  for (const w of DEMO_WAITING.filter((x) => x.type === "payment")) {
    await db.invoice.create({
      data: {
        organisationId: org.id,
        clientId: clientBySlug.get(w.clientCompany),
        projectId: projectBySlug.get(w.project),
        number: w.title,
        status: "overdue",
        currency: w.currency ?? "GBP",
        issueDate: daysAgo(w.daysWaiting + 14),
        dueDate: daysAgo(w.daysWaiting),
        subtotal: w.amount ?? 0,
        total: w.amount ?? 0,
        items: {
          create: [{ description: "Design services", quantity: 1, unitPrice: w.amount ?? 0, order: 0 }],
        },
      },
    });
  }

  // Waiting Room — the signature dataset.
  for (const w of DEMO_WAITING) {
    await db.waitingItem.create({
      data: {
        organisationId: org.id,
        clientId: clientBySlug.get(w.clientCompany),
        projectId: projectBySlug.get(w.project),
        type: w.type,
        title: w.title,
        sourceType: w.type,
        sourceId: w.title,
        amount: w.amount,
        currency: w.currency,
        status: "waiting",
        requestedAt: daysAgo(w.daysWaiting),
        lastRemindedAt: w.lastRemindedDays != null ? daysAgo(w.lastRemindedDays) : undefined,
        reminderCount: w.lastRemindedDays != null ? 1 : 0,
      },
    });
  }

  // Activity feed.
  const agoMap: Record<string, number> = { "2h": 0, "5h": 0, "1d": 1, "3d": 3 };
  for (const [i, a] of DEMO_ACTIVITY.entries()) {
    await db.activity.create({
      data: {
        organisationId: org.id,
        projectId: northstar,
        type: "system",
        actorType: a.actor === "System" ? "system" : "user",
        actorName: a.actor,
        summary: `${a.actor} ${a.action} ${a.target}`,
        createdAt: daysAgo(agoMap[a.ago] ?? i),
      },
    });
  }

  // Growth: a live hero-copy experiment + a campaign.
  await db.experiment.upsert({
    where: { key: "hero_copy" },
    update: {},
    create: {
      key: "hero_copy",
      name: "Homepage hero copy",
      status: "running",
      variants: {
        create: [
          { key: "pain", name: "Pain-led", weight: 50, payload: JSON.stringify({ headline: "Stop chasing your clients." }) },
          { key: "outcome", name: "Outcome-led", weight: 50, payload: JSON.stringify({ headline: "Give clients somewhere to look." }) },
        ],
      },
    },
  });

  await db.campaign.upsert({
    where: { key: "meta-stop-chasing-clients" },
    update: {},
    create: {
      key: "meta-stop-chasing-clients",
      name: "Meta — Stop Chasing Clients",
      channel: "meta",
      angle: "waiting",
      landingPath: "/lp/stop-chasing-clients",
    },
  });

  console.log("Seed complete.");
  console.log("  Demo login:   demo@clientfold.com / clientfold");
  console.log("  Internal:     growth@clientfold.com / clientfold");
  console.log(`  Client magic link:  ${appUrl}/invite/${inviteToken}`);
  console.log("  Or self-serve at /portal/enter with  sarah@northstar.co");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
