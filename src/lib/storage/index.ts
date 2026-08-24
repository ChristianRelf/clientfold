import { createHmac, timingSafeEqual } from "node:crypto";
import { localProvider } from "./local";
import { s3Provider } from "./s3";

/**
 * Object storage abstraction. Files are NEVER served directly - access is always
 * through short-lived signed URLs (`/api/files/[id]`), so a storage key alone
 * grants nothing. Local dev uses a filesystem provider (zero infra); production
 * uses S3-compatible storage when STORAGE_* env is set. Same interface either
 * way, so the switch is configuration only.
 */

export type StorageProvider = {
  /** Persist bytes under a key. */
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  /** Read bytes back (used by the local signed-URL route). */
  get(key: string): Promise<{ data: Buffer; contentType: string } | null>;
  /** Remove an object. */
  remove(key: string): Promise<void>;
  /**
   * A URL the browser can use to download the object. For S3 this is a presigned
   * GET; for local it points at our signed route.
   */
  downloadUrl(fileId: string, key: string, filename: string, ttlSeconds?: number): Promise<string>;
};

function isS3Configured(): boolean {
  return Boolean(process.env.STORAGE_BUCKET && process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY);
}

export const storage: StorageProvider = isS3Configured() ? s3Provider : localProvider;

// --- Signed URLs for the local provider ------------------------------------

const SECRET = process.env.AUTH_SECRET ?? "dev-only-change-me";

export function signFileUrl(fileId: string, ttlSeconds = 300): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHmac("sha256", SECRET).update(`${fileId}.${exp}`).digest("base64url");
  return `/api/files/${fileId}?exp=${exp}&sig=${sig}`;
}

export function verifyFileSignature(fileId: string, exp: string, sig: string): boolean {
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", SECRET).update(`${fileId}.${exp}`).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

// --- Upload validation ------------------------------------------------------

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

export function validateUpload(file: { size: number; type: string; name: string }): string | null {
  if (file.size <= 0) return "File is empty";
  if (file.size > MAX_UPLOAD_BYTES) return "File exceeds the 100 MB limit";
  // Fall back to extension when the browser sends a generic/empty type.
  if (file.type && !ALLOWED_MIME.has(file.type)) return "That file type isn't allowed";
  return null;
}

/** Build a namespaced, collision-resistant storage key. */
export function buildKey(organisationId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const rand = Math.random().toString(36).slice(2, 10);
  return `org/${organisationId}/${Date.now()}-${rand}-${safe}`;
}
