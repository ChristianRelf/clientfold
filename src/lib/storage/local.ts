import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { StorageProvider } from "./index";

/**
 * Filesystem-backed storage for local dev. Files live under ./.storage (git-
 * ignored). Content type is stored alongside the blob in a sidecar so the
 * signed-URL route can set the right header. Downloads go through our signed
 * route, never the raw path.
 */

const ROOT = path.join(process.cwd(), ".storage");

function resolve(key: string): string {
  const full = path.join(ROOT, key);
  // Prevent path traversal outside ROOT.
  if (!full.startsWith(ROOT)) throw new Error("Invalid storage key");
  return full;
}

export const localProvider: StorageProvider = {
  async put(key, data, contentType) {
    const full = resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
    await writeFile(`${full}.meta`, contentType || "application/octet-stream");
  },

  async get(key) {
    const full = resolve(key);
    if (!existsSync(full)) return null;
    const data = await readFile(full);
    let contentType = "application/octet-stream";
    if (existsSync(`${full}.meta`)) contentType = (await readFile(`${full}.meta`)).toString().trim();
    return { data, contentType };
  },

  async remove(key) {
    const full = resolve(key);
    await unlink(full).catch(() => {});
    await unlink(`${full}.meta`).catch(() => {});
  },

  async downloadUrl(fileId) {
    // Import lazily to avoid a cycle with the signer in index.ts.
    const { signFileUrl } = await import("./index");
    return signFileUrl(fileId);
  },
};
