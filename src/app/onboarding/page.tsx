import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Get started", robots: { index: false, follow: false } };

/**
 * Reached only when an authenticated user has no organisation membership (an
 * edge case — signup creates one). Guides them to create a workspace.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Wordmark className="mb-6" />
      <h1 className="text-xl font-semibold tracking-tight">Let&apos;s create your workspace</h1>
      <p className="mt-1.5 max-w-sm text-[13px] text-muted-foreground">
        You&apos;re signed in as {user.email}, but you don&apos;t have an organisation yet.
      </p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/waitlist">Join the waitlist</ButtonLink>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
