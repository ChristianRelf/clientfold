import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <Wordmark />
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
