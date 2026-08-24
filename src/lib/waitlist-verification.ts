import { hashToken } from "@/lib/auth/crypto";
import { db } from "@/lib/db";
import { notifyWaitlistDiscord } from "@/lib/discord";
import { trackEvent } from "@/lib/marketing/events";
import { recordConversion } from "@/lib/marketing/experiments";
import { captureReferral } from "@/lib/marketing/referrals";

export type WaitlistVerificationResult = "verified" | "already_verified" | "expired" | "invalid";

export function isValidWaitlistToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,64}$/.test(token);
}

export async function confirmWaitlistEmail(token: string): Promise<WaitlistVerificationResult> {
  if (!isValidWaitlistToken(token)) return "invalid";

  const tokenHash = hashToken(token);
  const entry = await db.waitlistEntry.findFirst({ where: { verificationTokenHash: tokenHash } });
  if (!entry) return "invalid";
  if (entry.verifiedAt) return "already_verified";

  const now = new Date();
  if (!entry.verificationExpiresAt || entry.verificationExpiresAt <= now) return "expired";

  const claimed = await db.waitlistEntry.updateMany({
    where: {
      id: entry.id,
      verifiedAt: null,
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { gt: now },
    },
    data: { verifiedAt: now },
  });

  if (claimed.count === 0) {
    const latest = await db.waitlistEntry.findUnique({ where: { id: entry.id } });
    return latest?.verifiedAt ? "already_verified" : "invalid";
  }

  const workType = entry.workType ?? "other";
  await Promise.all([
    captureReferral({ code: entry.referralCode, email: entry.email }),
    trackEvent("waitlist.joined", { visitorId: entry.visitorId ?? undefined }, { workType, source: entry.source ?? "direct" }),
    notifyWaitlistDiscord({
      name: entry.name,
      email: entry.email,
      organisation: entry.organisation ?? undefined,
      workType,
      source: entry.source ?? undefined,
      referral: entry.referralCode ?? undefined,
    }),
    ...(entry.visitorId
      ? [recordConversion(entry.visitorId, "hero_copy"), recordConversion(entry.visitorId, "pricing_presentation")]
      : []),
  ]);

  return "verified";
}
