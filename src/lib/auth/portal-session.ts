import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sign, unsign } from "./crypto";

/**
 * Client portal sessions. Entirely separate from staff sessions (different
 * cookie, different table). A client is not a User and can only ever reach the
 * portal — never the agency app.
 */

const PORTAL_COOKIE = "cf_portal";
const PORTAL_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type PortalClient = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  organisationId: string;
};

export async function createPortalSession(clientId: string): Promise<void> {
  const session = await db.clientSession.create({
    data: { clientId, expiresAt: new Date(Date.now() + PORTAL_TTL_MS) },
  });
  const jar = await cookies();
  jar.set(PORTAL_COOKIE, sign(session.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function destroyPortalSession(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(PORTAL_COOKIE)?.value;
  const id = raw ? unsign(raw) : null;
  if (id) await db.clientSession.deleteMany({ where: { id } });
  jar.delete(PORTAL_COOKIE);
}

export async function getPortalClient(): Promise<PortalClient | null> {
  const jar = await cookies();
  const raw = jar.get(PORTAL_COOKIE)?.value;
  if (!raw) return null;
  const id = unsign(raw);
  if (!id) return null;

  const session = await db.clientSession.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const { client } = session;
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    company: client.company,
    organisationId: client.organisationId,
  };
}
