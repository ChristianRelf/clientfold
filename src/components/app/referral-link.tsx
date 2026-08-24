"use client";

import { useRef, useState } from "react";

export function ReferralLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      inputRef.current?.select();
      if (!document.execCommand("copy")) return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        ref={inputRef}
        aria-label="Referral link"
        readOnly
        value={value}
        onFocus={(event) => event.currentTarget.select()}
        className="h-9 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 font-mono text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="button"
        onClick={copyLink}
        className="h-11 rounded-md border border-border bg-background px-3 text-[11px] font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
