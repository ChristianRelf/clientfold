import { createHash, createHmac } from "node:crypto";
import type { StorageProvider } from "./index";

/**
 * S3-compatible provider using dependency-free SigV4 presigned URLs. Works with
 * AWS S3 and compatible stores (R2, Backblaze, MinIO) via STORAGE_ENDPOINT.
 * Uploads and downloads use presigned URLs so bytes never transit our server.
 * Enabled automatically when STORAGE_* env is set (see index.ts).
 */

type S3Config = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string; // host, e.g. s3.eu-west-1.amazonaws.com or account.r2.cloudflarestorage.com
};

function config(): S3Config {
  return {
    bucket: process.env.STORAGE_BUCKET ?? "",
    region: process.env.STORAGE_REGION ?? "us-east-1",
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
    endpoint: (process.env.STORAGE_ENDPOINT ?? "s3.amazonaws.com").replace(/^https?:\/\//, ""),
  };
}

const sha256Hex = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const hmac = (key: Buffer | string, data: string) => createHmac("sha256", key).update(data).digest();

function signingKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** Presign a request for a key and HTTP method, valid for `expires` seconds. */
function presign(method: "GET" | "PUT" | "DELETE", key: string, expires: number, filename?: string): string {
  const c = config();
  const host = `${c.bucket}.${c.endpoint}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${c.region}/s3/aws4_request`;
  const canonicalUri = `/${key.split("/").map(encodeRfc3986).join("/")}`;

  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${c.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  if (filename && method === "GET") {
    query["response-content-disposition"] = `attachment; filename="${filename.replace(/"/g, "")}"`;
  }
  const canonicalQuery = Object.keys(query)
    .sort()
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(query[k])}`)
    .join("&");

  const canonicalRequest = [method, canonicalUri, canonicalQuery, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(c.secretAccessKey, date, c.region, "s3"))
    .update(stringToSign)
    .digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export const s3Provider: StorageProvider = {
  async put(key, data, contentType) {
    const url = presign("PUT", key, 300);
    const res = await fetch(url, {
      method: "PUT",
      body: new Uint8Array(data),
      headers: { "content-type": contentType || "application/octet-stream" },
    });
    if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
  },

  async get() {
    // Not used for S3 — downloads go straight to a presigned GET URL.
    return null;
  },

  async remove(key) {
    await fetch(presign("DELETE", key, 120), { method: "DELETE" }).catch(() => {});
  },

  async downloadUrl(_fileId, key, filename, ttlSeconds = 300) {
    return presign("GET", key, ttlSeconds, filename);
  },
};
