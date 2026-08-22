"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getVisitorId } from "@/lib/marketing/attribution";
import { trackEvent } from "@/lib/marketing/events";

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid work email"),
  organisation: z.string().trim().max(120).optional(),
  workType: z.enum(["freelancer", "studio", "agency", "consultancy", "other"]),
  source: z.string().trim().max(160).optional(),
});

export type WaitlistState = { error?: string; success?: boolean } | undefined;

export async function joinWaitlistAction(_previous: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details" };

  const { name, email, organisation, workType, source } = parsed.data;
  await db.waitlistEntry.upsert({
    where: { email },
    create: { name, email, organisation: organisation || null, workType, source: source || null },
    update: { name, organisation: organisation || null, workType, source: source || null },
  });

  const visitorId = (await getVisitorId()) ?? undefined;
  await trackEvent("waitlist.joined", { visitorId }, { workType, source: source ?? "direct" });
  return { success: true };
}
