import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { WAITING_TYPE_LABEL, type DemoWaitingItem } from "@/lib/demo/data";
import { RemindButton } from "./remind-button";
import { cn } from "@/lib/utils";
import { AutopilotControl } from "./autopilot-control";
import { formatReminderTime } from "@/lib/autopilot";

const TYPE_TONE: Record<DemoWaitingItem["type"], Parameters<typeof Badge>[0]["tone"]> = {
  approval: "accent",
  file_request: "neutral",
  payment: "danger",
  task: "warning",
  reply: "neutral",
};

/**
 * A single Waiting Room row. Deliberately screenshot-able: dense, calm, with the
 * "how long the client has kept you waiting" front and centre.
 */
export function WaitingItemRow({
  item,
  demo = false,
}: {
  item: DemoWaitingItem;
  demo?: boolean;
}) {
  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 hairline transition-colors hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{item.clientCompany}</span>
          <Badge tone={TYPE_TONE[item.type]}>{WAITING_TYPE_LABEL[item.type]}</Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="truncate">{item.title}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{item.detail}</span>
        </div>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        {item.type === "payment" && item.amount != null ? (
          <div className="font-mono text-sm font-medium text-danger">
            {formatMoney(item.amount, item.currency)}
          </div>
        ) : null}
        <div
          className={cn(
            "text-xs tabular-nums",
            item.daysWaiting >= 5 ? "font-medium text-waiting" : "text-muted-foreground",
          )}
        >
          Waiting {item.daysWaiting} {item.daysWaiting === 1 ? "day" : "days"}
        </div>
        {item.lastRemindedDays != null ? (
          <div className="text-2xs text-muted-foreground">Reminded {item.lastRemindedDays}d ago</div>
        ) : null}
        {item.autopilotEnabled ? (
          <div className="mt-0.5 text-2xs text-accent">
            {item.automaticReminderState === "paused"
              ? "Autopilot paused"
              : item.automaticReminderStep === 2
                ? "Final reminder sent"
                : item.nextAutomaticReminderAt
                  ? `Next ${formatReminderTime(new Date(item.nextAutomaticReminderAt), item.timezone ?? "Europe/London")}`
                  : "Autopilot on"}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={item.href}
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          View
        </Link>
        <RemindButton waitingItemId={item.id} demo={demo} />
        {!demo && item.autopilotEnabled && item.automaticReminderStep !== 2 ? <AutopilotControl waitingItemId={item.id} paused={item.automaticReminderState === "paused"} /> : null}
      </div>
    </div>
  );
}
