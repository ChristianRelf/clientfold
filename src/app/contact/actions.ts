"use server";

import { z } from "zod";
import { sendContactMessage } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  topic: z.enum(["product", "support", "billing", "integration", "privacy", "other"]),
  message: z.string().trim().min(20, "Add a little more detail so we can help").max(5000),
  company: z.string().max(0).optional(),
});

export type ContactState = { success?: boolean; error?: string } | undefined;

export async function sendContactAction(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  const { company: _company, ...message } = parsed.data;
  const result = await sendContactMessage(message);
  if (!result.accepted) return { error: "We could not send that just now. Please email hello@clientfold.com instead." };
  return { success: true };
}
