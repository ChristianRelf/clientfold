/**
 * Project health is derived from real state - never a meaningless AI score. We
 * always return a reason so the UI can explain *why*. Precedence:
 *   overdue > at_risk > waiting_on_client > on_track
 */

export type Health = "on_track" | "waiting_on_client" | "at_risk" | "overdue";

export type HealthInput = {
  targetDate?: Date | null;
  // Open items blocked on the client.
  waitingCount: number;
  // The soonest upcoming milestone due date and whether it's blocked.
  nextMilestoneDue?: Date | null;
  nextMilestoneBlockedByApproval?: boolean;
  overdueInvoiceCount: number;
};

export type HealthResult = { health: Health; reason: string };

const DAY = 86_400_000;

export function deriveHealth(input: HealthInput, now: Date = new Date()): HealthResult {
  const {
    targetDate,
    waitingCount,
    nextMilestoneDue,
    nextMilestoneBlockedByApproval,
    overdueInvoiceCount,
  } = input;

  // Overdue: the delivery target has passed with work outstanding.
  if (targetDate && targetDate.getTime() < now.getTime()) {
    return {
      health: "overdue",
      reason: "The target completion date has passed with items still open.",
    };
  }

  // At risk: an imminent milestone is blocked by a pending client approval.
  if (
    nextMilestoneBlockedByApproval &&
    nextMilestoneDue &&
    nextMilestoneDue.getTime() - now.getTime() <= DAY
  ) {
    return {
      health: "at_risk",
      reason:
        "The next milestone begins within a day but a required approval is still awaiting the client.",
    };
  }

  if (overdueInvoiceCount > 0 && waitingCount === 0) {
    return {
      health: "at_risk",
      reason: `${overdueInvoiceCount} invoice${overdueInvoiceCount > 1 ? "s are" : " is"} overdue.`,
    };
  }

  if (waitingCount > 0) {
    return {
      health: "waiting_on_client",
      reason:
        waitingCount === 1
          ? "One item is waiting on the client."
          : `${waitingCount} items are waiting on the client.`,
    };
  }

  return { health: "on_track", reason: "No blocking items. Work is progressing." };
}

export const HEALTH_LABEL: Record<Health, string> = {
  on_track: "On Track",
  waiting_on_client: "Waiting on Client",
  at_risk: "At Risk",
  overdue: "Overdue",
};
