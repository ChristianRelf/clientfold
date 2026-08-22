/**
 * Email abstraction. Uses Resend when RESEND_API_KEY is set; otherwise no-ops
 * (returning false) so local dev works without an email provider. We call the
 * REST API directly to avoid an SDK dependency. Returns true only when an email
 * was actually accepted for delivery.
 */

const FROM = process.env.EMAIL_FROM ?? "ClientFold <hello@clientfold.com>";

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function sendMagicLink(to: string, url: string): Promise<boolean> {
  return send(
    to,
    "Your ClientFold portal link",
    `<p>Here's your secure link to view your project portal:</p>
     <p><a href="${url}">Open your portal</a></p>
     <p>This link expires in 14 days. If you didn't request it, you can ignore this email.</p>`,
  );
}

export function sendClientInvite(to: string, url: string, orgName: string, projectName: string): Promise<boolean> {
  return send(
    to,
    `${orgName} invited you to ${projectName}`,
    `<p>${orgName} has set up a portal for <strong>${projectName}</strong>.</p>
     <p><a href="${url}">Open your portal</a></p>
     <p>You can review approvals, share files and see invoices — no account needed.</p>`,
  );
}

/** Notify agency staff that a client sent a message. */
export function sendClientMessageNotification(
  to: string,
  params: { orgName: string; projectName: string; clientName: string; preview: string; inboxUrl: string },
): Promise<boolean> {
  return send(
    to,
    `New message from ${params.clientName} — ${params.projectName}`,
    `<p><strong>${params.clientName}</strong> sent a message on <strong>${params.projectName}</strong>:</p>
     <blockquote style="border-left:3px solid #e2e8f0;padding-left:12px;color:#4b5563;">${params.preview}</blockquote>
     <p><a href="${params.inboxUrl}">View in inbox</a></p>`,
  );
}

/** Notify the client that the agency replied. */
export function sendAgencyReplyNotification(
  to: string,
  params: { orgName: string; projectName: string; preview: string; portalUrl: string },
): Promise<boolean> {
  return send(
    to,
    `New message from ${params.orgName} on ${params.projectName}`,
    `<p><strong>${params.orgName}</strong> sent a message on <strong>${params.projectName}</strong>:</p>
     <blockquote style="border-left:3px solid #e2e8f0;padding-left:12px;color:#4b5563;">${params.preview}</blockquote>
     <p><a href="${params.portalUrl}">View in your portal</a></p>`,
  );
}

/** A polite nudge for something waiting on the client, deep-linking the portal. */
export function sendReminderEmail(
  to: string,
  url: string,
  params: { orgName: string; projectName: string; itemTitle: string; action: string },
): Promise<boolean> {
  return send(
    to,
    `A quick reminder from ${params.orgName}: ${params.itemTitle}`,
    `<p>Hi,</p>
     <p>${params.orgName} is waiting on you for <strong>${params.itemTitle}</strong> on
     ${params.projectName}.</p>
     <p><a href="${url}">${params.action}</a></p>
     <p>It only takes a moment — thanks!</p>`,
  );
}
