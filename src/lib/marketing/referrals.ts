import { db } from "@/lib/db";

type Referrer = { code: string; type: "user" | "organisation"; id: string };

export async function resolveReferrer(rawCode: string): Promise<Referrer | null> {
  const code = rawCode.trim();
  if (!code || code.length > 80) return null;
  const [organisations, users] = await Promise.all([
    db.organisation.findMany({ where: { referralCode: { startsWith: code } }, select: { id: true, referralCode: true }, take: 2 }),
    db.user.findMany({ where: { referralCode: { startsWith: code } }, select: { id: true, referralCode: true }, take: 2 }),
  ]);
  const matches = [
    ...organisations.map((item) => ({ code: item.referralCode, type: "organisation" as const, id: item.id })),
    ...users.map((item) => ({ code: item.referralCode, type: "user" as const, id: item.id })),
  ];
  if (matches.length !== 1) return matches.find((item) => item.code === code) ?? null;
  return matches[0];
}

/** Capture a referral at waitlist or signup, folding the two touches into one row. */
export async function captureReferral(input: {
  code?: string | null;
  email?: string | null;
  signupUserId?: string;
  convertedOrgId?: string;
}): Promise<void> {
  if (!input.code) return;
  try {
    const referrer = await resolveReferrer(input.code);
    if (!referrer) return;
    const email = input.email?.trim().toLowerCase() || null;
    const existing = await db.referral.findFirst({
      where: {
        referralCode: referrer.code,
        OR: [
          ...(input.signupUserId ? [{ signupUserId: input.signupUserId }] : []),
          ...(email ? [{ waitlistEmail: email }] : []),
        ],
      },
    });
    const data = {
      waitlistEmail: email,
      signupUserId: input.signupUserId,
      signedUpAt: input.signupUserId ? new Date() : undefined,
      convertedOrgId: input.convertedOrgId,
    };
    if (existing) await db.referral.update({ where: { id: existing.id }, data });
    else await db.referral.create({ data: { referralCode: referrer.code, referrerType: referrer.type, referrerId: referrer.id, ...data } });
  } catch {
    // Referral attribution is best-effort and never blocks signup.
  }
}

export async function markReferralActivated(organisationId: string): Promise<void> {
  await db.referral.updateMany({ where: { convertedOrgId: organisationId, activatedAt: null }, data: { activatedAt: new Date() } }).catch(() => {});
}

export async function markReferralPaid(organisationId: string): Promise<void> {
  await db.referral.updateMany({ where: { convertedOrgId: organisationId, paidAt: null }, data: { paidAt: new Date() } }).catch(() => {});
}
