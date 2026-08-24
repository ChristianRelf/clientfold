import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/tenancy";
import { storage } from "@/lib/storage";

/**
 * Staff-side download. Verifies the user is a member of the file's organisation,
 * then redirects to a fresh short-lived download URL. Enforces tenancy - a user
 * can only download files from organisations they belong to.
 */
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await db.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db.organisationMember.findUnique({
    where: { organisationId_userId: { organisationId: file.organisationId, userId: user.id } },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: "No access" }, { status: 403 });

  const url = await storage.downloadUrl(file.id, file.storageKey, file.name);
  return NextResponse.redirect(new URL(url, request.url));
}
