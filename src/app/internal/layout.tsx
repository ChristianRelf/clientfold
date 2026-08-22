import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { robots: { index: false, follow: false } };

/** Internal tools are strictly gated: authenticated AND isInternal. */
export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isInternal) redirect("/home");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container flex h-12 items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold">ClientFold Internal</span>
            <Link href="/internal/growth" className="text-muted-foreground hover:text-foreground">
              Growth
            </Link>
          </div>
          <span className="text-2xs text-muted-foreground">{user.email}</span>
        </div>
      </header>
      {children}
    </div>
  );
}
