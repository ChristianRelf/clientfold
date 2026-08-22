import { getAppContext } from "@/lib/app";
import { getWaitingRoom } from "@/lib/queries/waiting";
import { PageHeader } from "@/components/app/page-header";
import { WaitingBoard } from "@/components/waiting/waiting-board";

export const metadata = { title: "Waiting" };
export const dynamic = "force-dynamic";

export default async function WaitingPage() {
  const ctx = await getAppContext();
  const items = await getWaitingRoom(ctx.org.id);

  return (
    <div className="min-h-full bg-workbench">
      <PageHeader
        title="Waiting on Clients"
        description="Everything still sitting with a client — sorted by how long they've kept you waiting."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-6 py-20 text-center">
            <h2 className="text-base font-semibold">Nothing waiting on your clients.</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">
              You&apos;re caught up. Items requiring client action will appear here.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <WaitingBoard items={items} currency={ctx.org.currency} />
          </div>
        )}
      </div>
    </div>
  );
}
