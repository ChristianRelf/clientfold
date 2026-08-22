import { WaitingBoard } from "@/components/waiting/waiting-board";
import { BrowserFrame } from "@/components/marketing/browser-frame";
import { ApprovalPreview } from "@/components/marketing/approval-preview";
import { PortalPreview } from "@/components/marketing/portal-preview";
import { DEMO_WAITING } from "@/lib/demo/data";

/** Renders the appropriate real product surface for a campaign angle. */
export function Showcase({ kind }: { kind: "waiting" | "approval" | "portal" }) {
  if (kind === "waiting") {
    return (
      <BrowserFrame url="clientfold.com/waiting">
        <div className="p-3 sm:p-4">
          <WaitingBoard items={DEMO_WAITING} demo />
        </div>
      </BrowserFrame>
    );
  }
  if (kind === "approval") {
    return (
      <div className="mx-auto max-w-md">
        <BrowserFrame url="clientfold.com/projects/northstar-website-redesign">
          <ApprovalPreview />
        </BrowserFrame>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-sm">
      <PortalPreview />
    </div>
  );
}
