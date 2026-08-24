"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Region-appropriate consent. Non-essential trackers are never loaded before a
 * choice is made. Choices are stored (cookie + DB) and can be withdrawn by
 * returning to any page and choosing again (we re-show if no choice recorded).
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show inside the private app / portal / internal tools.
    const hidden = ["/home", "/waiting", "/projects", "/clients", "/inbox", "/invoices", "/files", "/settings", "/internal", "/portal"];
    if (hidden.some((p) => pathname.startsWith(p))) {
      setVisible(false);
      return;
    }
    if (!document.cookie.includes("cf_consent_set=1")) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener("clientfold:cookie-settings", reopen);
    return () => window.removeEventListener("clientfold:cookie-settings", reopen);
  }, [pathname]);

  async function choose(analytics: boolean, advertising: boolean) {
    setVisible(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ analytics, advertising }),
      });
      window.dispatchEvent(new Event("clientfold:consent-changed"));
    } catch {
      /* noop */
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-in border-t border-[#cfcec7] bg-[#f3f2ed]/95 shadow-[0_-20px_45px_-38px_rgba(37,40,33,.5)] backdrop-blur-md">
      <div className="container flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[11px] leading-5 text-[#686b63]">
          Essential cookies keep ClientFold working. With your permission, we also use first-party analytics and advertising measurement. Read our <Link href="/cookies" className="underline underline-offset-4 hover:text-[#30332c]">Cookie Notice</Link>.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => choose(false, false)}
            className="px-3 py-2 text-[10px] font-medium text-[#686b63] hover:text-[#30332c]"
          >
            Essential only
          </button>
          <button
            onClick={() => choose(true, false)}
            className="border border-[#c9c8c1] px-3 py-2 text-[10px] font-medium hover:bg-white/60"
          >
            Analytics
          </button>
          <button
            onClick={() => choose(true, true)}
            className="bg-[#2d302a] px-3 py-2 text-[10px] font-medium text-white hover:bg-[#44473f]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
