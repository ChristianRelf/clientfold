/** Formatting helpers shared by app, portal and marketing surfaces. */

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

/** Format minor units (pence/cents) as a currency string. */
export function formatMoney(minor: number, currency = "GBP"): string {
  const value = minor / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] ?? "";
    return `${symbol}${value.toLocaleString("en-GB")}`;
  }
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", opts ?? { day: "numeric", month: "long", year: "numeric" }).format(d);
}

const DIVISIONS: [number, Intl.RelativeTimeFormatUnit][] = [
  [60, "seconds"],
  [60, "minutes"],
  [24, "hours"],
  [7, "days"],
  [4.34524, "weeks"],
  [12, "months"],
  [Number.POSITIVE_INFINITY, "years"],
];

/** "4 days ago" / "in 2 days" — compact and human. */
export function relativeTime(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  let duration = (d.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  let unitDuration = duration;
  for (const [amount, unit] of DIVISIONS) {
    if (Math.abs(unitDuration) < amount) {
      return rtf.format(Math.round(unitDuration), unit);
    }
    unitDuration /= amount;
  }
  return rtf.format(Math.round(duration), "years");
}

/** Whole days a client has been kept waiting — used for sorting & badges. */
export function daysWaiting(since: Date | string, now: Date = new Date()): number {
  const d = typeof since === "string" ? new Date(since) : since;
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86_400_000));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
