import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifySignedWebhook(params: {
  payload: string;
  id?: string | null;
  timestamp?: string | null;
  signatures?: string | null;
  secret?: string | null;
  now?: number;
}): boolean {
  const { payload, id, timestamp, signatures, secret, now = Date.now() } = params;
  if (!secret || !id || !timestamp || !signatures) return false;
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(now / 1000 - seconds) > 5 * 60) return false;
  try {
    const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
    const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest();
    return signatures.split(" ").some((entry) => {
      const encoded = entry.startsWith("v1,") ? entry.slice(3) : entry;
      const actual = Buffer.from(encoded, "base64");
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    });
  } catch { return false; }
}

export function inboundTokenFromRecipients(recipients: string[]): string | null {
  for (const recipient of recipients) {
    const address = recipient.match(/<?([^<>\s]+@[^<>\s]+)>?$/)?.[1] ?? recipient;
    const local = address.split("@")[0] ?? "";
    const match = local.match(/^marketplace\+([A-Za-z0-9_-]{16,})$/);
    if (match) return match[1];
  }
  return null;
}

export function hashInboundToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function inboundTokenForConnection(connectionId: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-only-change-me";
  return createHmac("sha256", secret).update(`marketplace-inbound:${connectionId}`).digest("base64url").slice(0, 28);
}

export function inboundAddressForConnection(connectionId: string): string | null {
  const domain = process.env.INBOUND_EMAIL_DOMAIN;
  return domain ? `marketplace+${inboundTokenForConnection(connectionId)}@${domain}` : null;
}
