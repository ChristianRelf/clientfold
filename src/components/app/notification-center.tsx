"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NotificationView } from "@/lib/notifications";
import { relativeTime } from "@/lib/format";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/(app)/notifications/actions";

export function NotificationCenter({ notifications }: { notifications: NotificationView[] }) {
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unread = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function markRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread ? <span className="absolute right-1 top-1 grid min-w-3.5 place-items-center rounded-full bg-waiting px-0.5 text-[8px] font-bold leading-3.5 text-white">{unread > 9 ? "9+" : unread}</span> : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background shadow-pop">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold">Notifications</div>
              <div className="text-[10px] text-muted-foreground">Workspace activity that needs your attention</div>
            </div>
            {unread ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => { await markAllNotificationsReadAction(); router.refresh(); })}
                className="text-[10px] font-medium text-accent hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[24rem] overflow-y-auto">
            {notifications.length ? notifications.map((item) => {
              const content = (
                <>
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${item.readAt ? "bg-border" : "bg-accent"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium leading-5">{item.title}</span>
                    {item.body ? <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{item.body}</span> : null}
                    <span className="mt-1 block text-[9px] text-muted-foreground">{relativeTime(item.createdAt)}</span>
                  </span>
                </>
              );
              return item.href ? (
                <Link key={item.id} href={item.href} onClick={() => { markRead(item.id); setOpen(false); }} className="flex gap-2.5 border-b border-border/70 px-4 py-3 transition-colors last:border-0 hover:bg-surface">{content}</Link>
              ) : (
                <button key={item.id} type="button" onClick={() => markRead(item.id)} className="flex w-full gap-2.5 border-b border-border/70 px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface">{content}</button>
              );
            }) : (
              <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">You’re all caught up.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
