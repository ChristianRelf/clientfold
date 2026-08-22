import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPortalClient } from "@/lib/auth/portal-session";
import { assertClientProject } from "@/lib/portal";
import { storage } from "@/lib/storage";

/**
 * Portal download link. Verifies the client's session AND that they're assigned
 * to the file's project, then redirects to a fresh short-lived download URL
 * (signed local route, or presigned S3). Clients never see raw storage keys.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getPortalClient();
  if (!client) return NextResponse.json({ error: "Session expired" }, { status: 401 });

  const file = await db.file.findUnique({ where: { id } });
  if (!file || !file.projectId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await assertClientProject(client.id, file.projectId);
  if (!allowed) return NextResponse.json({ error: "No access" }, { status: 403 });

  const url = await storage.downloadUrl(file.id, file.storageKey, file.name);
  return NextResponse.redirect(new URL(url, request.url));
}
