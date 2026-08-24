import { createHash } from "node:crypto";
import type { NormalizedMarketplaceItem } from "./marketplace";

export function itemFingerprint(item: NormalizedMarketplaceItem): string {
  return createHash("sha256")
    .update(JSON.stringify({
      provider: item.provider,
      externalId: item.externalId,
      title: item.title,
      buyer: item.buyer?.handle,
      occurredAt: item.sourceOccurredAt,
      financials: item.financials,
    }))
    .digest("hex");
}
