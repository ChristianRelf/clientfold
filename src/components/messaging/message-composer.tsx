"use client";

import { useMemo, useRef, useState, useTransition } from "react";

/**
 * A minimal message composer. Takes a bound server action `(FormData) => void`
 * so it works for both the portal (client) and the agency inbox (staff). Clears
 * on success; the page's revalidation re-renders the thread with the new message.
 */
export function MessageComposer({
  action,
  placeholder = "Write a message…",
  disabled = false,
  mentionables = [],
}: {
  action: (formData: FormData) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  mentionables?: { id: string; label: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const mentionQuery = value.match(/(?:^|\s)@([^\s@]*)$/)?.[1]?.toLowerCase();
  const suggestions = useMemo(() => mentionQuery == null ? [] : mentionables.filter((item) => item.label.toLowerCase().includes(mentionQuery)).slice(0, 5), [mentionQuery, mentionables]);

  function updateFiles(next: File[]) {
    const selected = next.slice(0, 5);
    const transfer = new DataTransfer();
    selected.forEach((file) => transfer.items.add(file));
    if (fileRef.current) fileRef.current.files = transfer.files;
    setFiles(selected);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled || (!value.trim() && files.length === 0)) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
      setValue("");
      setFiles([]);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="relative flex items-end gap-2">
      <div className="min-w-0 flex-1">
      {suggestions.length ? <div className="absolute bottom-full left-0 z-20 mb-1 w-56 overflow-hidden rounded-md border border-border bg-background shadow-pop">{suggestions.map((item) => <button key={item.id} type="button" onClick={() => setValue((current) => current.replace(/@[^\s@]*$/, `@${item.label} `))} className="block w-full px-3 py-2 text-left text-[12px] hover:bg-surface">@{item.label}</button>)}</div> : null}
      <textarea
        name="body"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={disabled ? "Sending is disabled in the demo" : placeholder}
        rows={2}
        disabled={disabled || pending}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        className="min-h-[42px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      />
      {files.length ? <div className="mt-1 flex flex-wrap gap-1">{files.map((file, index) => <span key={`${file.name}-${index}`} className="rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">{file.name}<button type="button" className="ml-1 text-foreground" onClick={() => updateFiles(files.filter((_, i) => i !== index))}>×</button></span>)}</div> : null}
      </div>
      <label className="grid h-[42px] shrink-0 cursor-pointer place-items-center rounded-md border border-border px-3 text-muted-foreground hover:bg-muted hover:text-foreground" title="Attach files">
        <input ref={fileRef} name="attachments" type="file" multiple className="sr-only" disabled={disabled || pending} onChange={(event) => updateFiles(Array.from(event.target.files ?? []))} />
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden><path d="m8 12 5.5-5.5a3 3 0 0 1 4.2 4.2L10 18.4a5 5 0 0 1-7.1-7.1l8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </label>
      <button
        type="submit"
        disabled={disabled || pending || (!value.trim() && files.length === 0)}
        className="h-[42px] shrink-0 rounded-md bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
