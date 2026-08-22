"use server";

import { z } from "zod";
import { issueLinkByEmail } from "@/lib/auth/invitations";
import { sendMagicLink } from "@/lib/email";

export type EnterState = { sent?: boolean; devLink?: string; error?: string } | undefined;

const schema = z.object({ email: z.string().email() });

/**
 * Self-service portal re-entry. To avoid email enumeration we always report
 * success. If a matching client exists we email them a fresh magic link. In dev
 * (no email provider configured) we surface the link directly so the flow is
 * testable end-to-end.
 */
export async function requestPortalLinkAction(_prev: EnterState, formData: FormData): Promise<EnterState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address" };

  const invite = await issueLinkByEmail(parsed.data.email);
  if (invite) {
    const delivered = await sendMagicLink(parsed.data.email, invite.url);
    // Only reveal the link in dev when no real email was sent.
    if (!delivered && process.env.NODE_ENV !== "production") {
      return { sent: true, devLink: invite.url };
    }
  }
  return { sent: true };
}
