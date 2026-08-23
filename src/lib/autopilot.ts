export type ReminderSchedule = {
  step: 1 | 2;
  scheduledFor: Date;
};

export type ReminderDeliveryResult = {
  accepted: boolean;
  providerId?: string;
  errorCode?: string;
};

export type ReminderJobResult = {
  scanned: number;
  sent: number;
  skipped: number;
  failed: number;
};

export const AUTOPILOT_PLANS = new Set(["solo", "studio", "agency"]);
export const AUTOPILOT_OFFSETS = [3, 7] as const;
export const REMINDER_ACTION_LABEL: Record<string, string> = {
  approval: "Review it now",
  file_request: "Upload your files",
  payment: "Pay the invoice",
  task: "Complete the request",
  reply: "Reply now",
};

export function isAutopilotPlan(plan: string): boolean {
  return AUTOPILOT_PLANS.has(plan);
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function zonedLocalToUtc(year: number, month: number, day: number, hour: number, timezone: string): Date {
  const target = Date.UTC(year, month - 1, day, hour, 0, 0);
  let guess = new Date(target);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = zonedParts(guess, timezone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    guess = new Date(guess.getTime() + (target - represented));
  }
  return guess;
}

function addLocalDays(parts: { year: number; month: number; day: number }, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function rollWeekend(parts: { year: number; month: number; day: number }) {
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return weekday === 6 ? addLocalDays(parts, 2) : weekday === 0 ? addLocalDays(parts, 1) : parts;
}

export function scheduleForStep(anchor: Date, step: 1 | 2, timezone: string): ReminderSchedule {
  const base = zonedParts(anchor, timezone);
  const localDate = rollWeekend(addLocalDays(base, AUTOPILOT_OFFSETS[step - 1]));
  return { step, scheduledFor: zonedLocalToUtc(localDate.year, localDate.month, localDate.day, 10, timezone) };
}

export function scheduleStaleFirstReminder(now: Date, timezone: string): ReminderSchedule {
  const parts = zonedParts(now, timezone);
  let localDate = { year: parts.year, month: parts.month, day: parts.day };
  if (parts.hour >= 10) localDate = addLocalDays(localDate, 1);
  localDate = rollWeekend(localDate);
  return { step: 1, scheduledFor: zonedLocalToUtc(localDate.year, localDate.month, localDate.day, 10, timezone) };
}

export function postponeAfterManualReminder(now: Date, timezone: string): Date {
  const parts = zonedParts(now, timezone);
  const localDate = rollWeekend(addLocalDays(parts, 3));
  return zonedLocalToUtc(localDate.year, localDate.month, localDate.day, 10, timezone);
}

export function scheduleAfterLocalDays(now: Date, days: number, timezone: string): Date {
  const parts = zonedParts(now, timezone);
  const localDate = rollWeekend(addLocalDays(parts, days));
  return zonedLocalToUtc(localDate.year, localDate.month, localDate.day, 10, timezone);
}

export function formatReminderTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "long", hour: "2-digit", minute: "2-digit" }).format(date);
}
