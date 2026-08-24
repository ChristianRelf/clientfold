import { getPortalClient } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/logo";
import { EnterForm } from "@/components/portal/enter-form";

export const metadata = { title: "Open your portal", robots: { index: false, follow: false } };

export default async function PortalEnterPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const existing = await getPortalClient();
  if (existing) redirect("/portal");
  const { expired } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Wordmark className="mb-8 text-[15px]" />
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Open your portal</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {expired
            ? "That link has expired or been used. Enter your email and we'll send a fresh one."
            : "Enter the email your project team used to invite you. We'll send you a secure link - no password needed."}
        </p>
        <div className="mt-5">
          <EnterForm />
        </div>
      </div>
      <p className="mt-6 text-2xs text-muted-foreground">Secured by ClientFold</p>
    </div>
  );
}
