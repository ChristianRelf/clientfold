import { db } from "@/lib/db";
import { buildKey, storage, validateUpload } from "@/lib/storage";

export type MessageAttachmentView = { id: string; name: string; mimeType: string; size: number };

export function parseAttachmentIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function saveMessageAttachments(input: {
  files: File[];
  organisationId: string;
  projectId?: string | null;
  threadId: string;
  uploaderType: "user" | "client";
  uploaderId: string;
}): Promise<string[]> {
  if (input.files.length > 5) throw new Error("Attach up to five files per message.");
  for (const file of input.files) {
    const problem = validateUpload(file);
    if (problem) throw new Error(problem);
  }
  const ids: string[] = [];
  for (const upload of input.files) {
    const key = buildKey(input.organisationId, upload.name);
    const bytes = Buffer.from(await upload.arrayBuffer());
    const mimeType = upload.type || "application/octet-stream";
    await storage.put(key, bytes, mimeType);
    const file = await db.file.create({
      data: {
        organisationId: input.organisationId,
        projectId: input.projectId ?? null,
        name: upload.name,
        mimeType,
        size: bytes.length,
        storageKey: key,
        relatedType: "message",
        relatedId: input.threadId,
        uploaderType: input.uploaderType,
        uploaderId: input.uploaderId,
        versions: { create: { version: 1, storageKey: key, size: bytes.length } },
      },
    });
    ids.push(file.id);
  }
  return ids;
}
