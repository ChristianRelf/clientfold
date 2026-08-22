"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { createSession, destroySession } from "@/lib/auth/session";
import { slugify, uniqueSlug } from "@/lib/slug";
import { trackEvent } from "@/lib/marketing/events";
import { getVisitorId, linkAttribution } from "@/lib/marketing/attribution";

const signupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  organisation: z.string().min(1).max(120),
  plan: z.string().optional(),
  ref: z.string().optional(),
});

export type ActionState = { error?: string } | undefined;

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }
  const { name, email, password, organisation, plan } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists" };

  const visitorId = (await getVisitorId()) ?? undefined;
  await trackEvent("auth.signup_started", { visitorId }, { plan: plan ?? "free" });

  const slug = await uniqueSlug(organisation, async (s) => {
    return Boolean(await db.organisation.findUnique({ where: { slug: s } }));
  });

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      memberships: {
        create: {
          role: "owner",
          organisation: {
            create: {
              name: organisation,
              slug,
              plan: plan ?? "free",
              subscription: { create: { plan: plan ?? "free", status: "active" } },
            },
          },
        },
      },
    },
    include: { memberships: { include: { organisation: true } } },
  });

  const org = user.memberships[0]?.organisation;
  if (visitorId && org) await linkAttribution(visitorId, { userId: user.id, organisationId: org.id });

  await trackEvent(
    "auth.signup_completed",
    { visitorId, userId: user.id, organisationId: org?.id },
    { plan: plan ?? "free" },
  );
  await trackEvent(
    "onboarding.organisation_created",
    { visitorId, userId: user.id, organisationId: org?.id },
    {},
  );

  await createSession(user.id);
  redirect("/home");
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password" };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { error: "Incorrect email or password" };
  }

  await createSession(user.id);
  redirect("/home");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

// Kept for the slug helper's type inference in one place.
export { slugify };
