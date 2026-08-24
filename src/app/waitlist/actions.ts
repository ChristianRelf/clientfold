"use server";

import { z } from "zod";
import { generateToken, hashToken } from "@/lib/auth/crypto";
import { db } from "@/lib/db";
import { sendWaitlistVerification } from "@/lib/email";
import { getVisitorId } from "@/lib/marketing/attribution";

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid work email"),
  organisation: z.string().trim().max(120).optional(),
  workType: z.enum(["freelancer", "studio", "agency", "consultancy", "other"]),
  source: z.string().trim().max(160).optional(),
  ref: z.string().trim().max(80).optional(),
});

export type WaitlistState = {
  error?: string;
  status?: "verification_sent" | "already_verified";
  email?: string;
} | undefined;

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function joinWaitlistAction(_previous: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details" };

  const { name, email, organisation, workType, source, ref } = parsed.data;
  const visitorId = (await getVisitorId()) ?? undefined;
  const existing = await db.waitlistEntry.findUnique({ where: { email } });

  if (existing?.verifiedAt) {
    await db.waitlistEntry.update({
      where: { email },
      data: { name, organisation: organisation || null, workType, source: source || null },
    });
    return { status: "already_verified", email };
  }

  const recentlySent = existing?.verificationSentAt
    && Date.now() - existing.verificationSentAt.getTime() < RESEND_COOLDOWN_MS;
  if (recentlySent) {
    await db.waitlistEntry.update({
      where: { email },
      data: {
        name,
        organisation: organisation || null,
        workType,
        source: source || null,
        referralCode: ref || null,
        visitorId,
      },
    });
    return { status: "verification_sent", email };
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const verificationExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);
  await db.waitlistEntry.upsert({
    where: { email },
    create: {
      name,
      email,
      organisation: organisation || null,
      workType,
      source: source || null,
      referralCode: ref || null,
      visitorId,
      verificationTokenHash: tokenHash,
      verificationExpiresAt,
    },
    update: {
      name,
      organisation: organisation || null,
      workType,
      source: source || null,
      referralCode: ref || null,
      visitorId,
      verificationTokenHash: tokenHash,
      verificationExpiresAt,
    },
  });

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verificationUrl = new URL("/waitlist/verify", baseUrl);
  verificationUrl.searchParams.set("token", token);
  const delivery = await sendWaitlistVerification(email, name, verificationUrl.toString(), tokenHash);
  if (!delivery.accepted) {
    console.warn(`Waitlist verification email failed: ${delivery.errorCode ?? "unknown_error"}`);
    return { error: "We couldn't send the confirmation email. Please try again in a moment." };
  }

  await db.waitlistEntry.updateMany({
    where: { email, verificationTokenHash: tokenHash },
    data: { verificationSentAt: new Date() },
  });
  return { status: "verification_sent", email };
}
