import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Log in to your ClientFold workspace.</p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <p className="mt-5 text-center text-[13px] text-muted-foreground">
        New to ClientFold?{" "}
        <Link href="/waitlist" className="font-medium text-foreground hover:underline">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}
