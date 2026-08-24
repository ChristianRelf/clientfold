import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware. Runs before every request to:
 *  1. Ensure a first-party anonymous visitor id exists (for attribution and
 *     experiments) - set here so even fully-cached pages get one. No DB access
 *     on the edge; persistence happens server-side on meaningful events.
 *  2. Belt-and-braces noindex for private surfaces.
 *
 * We intentionally do NOT write UTM data to the DB here (edge can't reach
 * Prisma). Landing pages read the query string and persist via server actions,
 * preserving first-touch.
 */
const VISITOR_COOKIE = "cf_attrib";
const PRIVATE_PREFIXES = ["/home", "/waiting", "/projects", "/clients", "/inbox", "/invoices", "/files", "/settings", "/internal", "/portal"];

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Attribution is non-essential: create it only after analytics consent.
  const analyticsAllowed = request.cookies.get("cf_consent_analytics")?.value === "1";
  if (analyticsAllowed && !request.cookies.get(VISITOR_COOKIE)) {
    res.cookies.set(VISITOR_COOKIE, randomId(), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (PRIVATE_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p))) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  // Skip static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
