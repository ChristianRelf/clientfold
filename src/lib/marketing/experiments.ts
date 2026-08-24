import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Lightweight experimentation. Assignment is deterministic per visitor (stable
 * across reloads without a write on the hot path) and also persisted for
 * exposure/conversion analysis. Rendered pages stay semantically appropriate -
 * we vary copy, not intent - so this is not SEO cloaking.
 */

export type Variant = { key: string; name: string; payload: Record<string, unknown> };

/** Deterministic bucket in [0,1) from visitorId + experiment key. */
function bucket(visitorId: string, experimentKey: string): number {
  const h = createHash("sha256").update(`${experimentKey}:${visitorId}`).digest();
  // First 4 bytes → uint32 → [0,1).
  const n = h.readUInt32BE(0);
  return n / 0xffffffff;
}

/** Pick a weighted variant deterministically for this visitor. */
export function pickVariant(visitorId: string, experimentKey: string, variants: { key: string; weight: number }[]): string {
  const total = variants.reduce((s, v) => s + Math.max(0, v.weight), 0) || 1;
  const point = bucket(visitorId, experimentKey) * total;
  let acc = 0;
  for (const v of variants) {
    acc += Math.max(0, v.weight);
    if (point < acc) return v.key;
  }
  return variants[variants.length - 1]?.key ?? "control";
}

/**
 * Resolve a visitor's variant for a running experiment and record exposure once.
 * Falls back to `fallback` when the experiment is missing/paused so pages always
 * render.
 */
export async function getVariant(
  visitorId: string | null,
  experimentKey: string,
  fallback: Variant,
): Promise<Variant> {
  if (!visitorId) return fallback;
  try {
    const experiment = await db.experiment.findUnique({
      where: { key: experimentKey },
      include: { variants: true },
    });
    if (!experiment || experiment.status !== "running" || experiment.variants.length === 0) {
      return fallback;
    }

    const chosenKey = pickVariant(
      visitorId,
      experimentKey,
      experiment.variants.map((v) => ({ key: v.key, weight: v.weight })),
    );
    const variant = experiment.variants.find((v) => v.key === chosenKey) ?? experiment.variants[0];

    // Record exposure idempotently.
    await db.experimentAssignment.upsert({
      where: { experimentId_visitorId: { experimentId: experiment.id, visitorId } },
      create: { experimentId: experiment.id, variantId: variant.id, visitorId },
      update: {},
    });

    return {
      key: variant.key,
      name: variant.name,
      payload: variant.payload ? JSON.parse(variant.payload) : {},
    };
  } catch {
    return fallback;
  }
}

/** Mark the visitor's assignment as converted (idempotent-ish). */
export async function recordConversion(visitorId: string, experimentKey: string): Promise<void> {
  try {
    const experiment = await db.experiment.findUnique({ where: { key: experimentKey } });
    if (!experiment) return;
    await db.experimentAssignment.updateMany({
      where: { experimentId: experiment.id, visitorId, convertedAt: null },
      data: { convertedAt: new Date() },
    });
  } catch {
    /* noop */
  }
}
