import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storage, verifyFileSignature } from "@/lib/storage";

/**
 * Serve a file via a short-lived signed URL (local provider). The HMAC signature
 * IS the capability - it's unguessable and expires - so a leaked storage key
 * grants nothing. S3 downloads never reach here (they use a presigned S3 URL).
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const exp = url.searchParams.get("exp") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  if (!verifyFileSignature(id, exp, sig)) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  const file = await db.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const object = await storage.get(file.storageKey);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(object.data as unknown as BodyInit, {
    headers: {
      "content-type": object.contentType,
      "content-disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`,
      "content-length": String(object.data.length),
      "cache-control": "private, max-age=300",
    },
  });
}
