import { scryptSync, randomBytes, timingSafeEqual, createHmac, createHash } from "node:crypto";

/**
 * Zero-dependency crypto for passwords, tokens and HMAC signing. Uses Node's
 * scrypt for password hashing and HMAC-SHA256 for signed values. In production
 * these APIs are the same; only the AUTH_SECRET changes.
 */

const SECRET = process.env.AUTH_SECRET ?? "dev-only-change-me";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Cryptographically secure token for invitations / magic links. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Store only the hash of a token; compare against this on redemption. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Hash an IP for audit records — never store raw PII. */
export function hashIp(ip: string): string {
  return createHmac("sha256", SECRET).update(ip).digest("hex").slice(0, 32);
}

/** Sign an opaque value (e.g. session id) for cookie integrity. */
export function sign(value: string): string {
  const mac = createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${value}.${mac}`;
}

export function unsign(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const expected = createHmac("sha256", SECRET).update(value).digest("base64url");
  const provided = signed.slice(idx + 1);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}
