import { cn } from "@/lib/utils";
import type { IntegrationDefinition } from "@/lib/integrations/registry";

export function IntegrationLogo({
  integration,
  className,
}: {
  integration: IntegrationDefinition;
  className?: string;
}) {
  const showLogo = integration.brandAssetMode === "logo" && integration.logoPath;
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/80 bg-white p-2 shadow-xs", className)}>
      {showLogo ? (
        // The adjacent visible provider name is the accessible label.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={integration.logoPath} alt="" aria-hidden className="max-h-full max-w-full object-contain" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="size-5 text-foreground" aria-hidden>
          <path d="M9 8V5m6 3V5M8 11h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-2Zm4 6v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

