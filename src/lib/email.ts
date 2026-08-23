import type { ReminderDeliveryResult } from "@/lib/autopilot";

const FROM = process.env.EMAIL_FROM ?? "ClientFold <hello@clientfold.com>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

async function send(
  to: string,
  subject: string,
  html: string,
  options: { idempotencyKey?: string; replyTo?: string; from?: string } = {},
): Promise<ReminderDeliveryResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { accepted: false, errorCode: "email_not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: options.from ?? FROM,
        to,
        subject,
        html,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      }),
    });
    const payload = await res.json().catch(() => ({})) as { id?: string; name?: string };
    return res.ok
      ? { accepted: true, providerId: payload.id }
      : { accepted: false, errorCode: payload.name ?? `http_${res.status}` };
  } catch {
    return { accepted: false, errorCode: "network_error" };
  }
}

export function sendMagicLink(to: string, url: string): Promise<ReminderDeliveryResult> {
  return send(to, "Your ClientFold portal link", `<p>Here&apos;s your secure link to view your project portal:</p><p><a href="${escapeHtml(url)}">Open your portal</a></p><p>This link expires in 14 days. If you didn&apos;t request it, you can ignore this email.</p>`);
}

export function sendClientInvite(to: string, url: string, orgName: string, projectName: string): Promise<ReminderDeliveryResult> {
  return send(to, `${orgName} invited you to ${projectName}`, `<p>${escapeHtml(orgName)} has set up a portal for <strong>${escapeHtml(projectName)}</strong>.</p><p><a href="${escapeHtml(url)}">Open your portal</a></p><p>You can review approvals, share files and see invoices—no account needed.</p>`);
}

export function sendClientMessageNotification(to: string, params: { orgName: string; projectName: string; clientName: string; preview: string; inboxUrl: string }): Promise<ReminderDeliveryResult> {
  return send(to, `New message from ${params.clientName} — ${params.projectName}`, `<p><strong>${escapeHtml(params.clientName)}</strong> sent a message on <strong>${escapeHtml(params.projectName)}</strong>:</p><blockquote style="border-left:3px solid #e2e8f0;padding-left:12px;color:#4b5563;">${escapeHtml(params.preview)}</blockquote><p><a href="${escapeHtml(params.inboxUrl)}">View in inbox</a></p>`);
}

export function sendAgencyReplyNotification(to: string, params: { orgName: string; projectName: string; preview: string; portalUrl: string }): Promise<ReminderDeliveryResult> {
  return send(to, `New message from ${params.orgName} on ${params.projectName}`, `<p><strong>${escapeHtml(params.orgName)}</strong> sent a message on <strong>${escapeHtml(params.projectName)}</strong>:</p><blockquote style="border-left:3px solid #e2e8f0;padding-left:12px;color:#4b5563;">${escapeHtml(params.preview)}</blockquote><p><a href="${escapeHtml(params.portalUrl)}">View in your portal</a></p>`);
}

export function sendReminderEmail(
  to: string,
  url: string,
  params: { orgName: string; projectName: string; itemTitle: string; action: string; clientName?: string; automatic?: boolean; idempotencyKey?: string; replyTo?: string },
): Promise<ReminderDeliveryResult> {
  const greeting = params.clientName ? `Hi ${escapeHtml(params.clientName)},` : "Hi,";
  const footer = params.automatic ? `<p style="color:#777970;font-size:12px;">This gentle reminder was sent automatically by ${escapeHtml(params.orgName)} through ClientFold. Reply to this email if you need help.</p>` : "";
  return send(
    to,
    `A quick reminder from ${params.orgName}: ${params.itemTitle}`,
    `<p>${greeting}</p><p>${escapeHtml(params.orgName)} is waiting on you for <strong>${escapeHtml(params.itemTitle)}</strong> on ${escapeHtml(params.projectName)}.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#2d302a;color:#fff;padding:11px 16px;text-decoration:none;">${escapeHtml(params.action)}</a></p><p>It only takes a moment—thanks.</p>${footer}`,
    { idempotencyKey: params.idempotencyKey, replyTo: params.replyTo },
  );
}
