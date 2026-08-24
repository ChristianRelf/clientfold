"use client";

import { useMemo, useState, useTransition } from "react";
import { createProjectWizardAction } from "@/app/(app)/projects/wizard-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClientOption = { id: string; label: string; email: string };
type Milestone = { title: string; dueDate: string };

const STEPS = ["Details", "Milestones", "Invite client", "Review"];

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[13px] font-medium">{children}</span>;
}

export function ProjectWizard({ clients }: { clients: ClientOption[] }) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [existingClientId, setExistingClientId] = useState("");

  // Step 2
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Step 3
  const [newClient, setNewClient] = useState({ name: "", email: "", company: "" });
  const [sendInvite, setSendInvite] = useState(true);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === existingClientId),
    [clients, existingClientId],
  );

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    setError(null);
    const hasNewClient = !existingClientId && newClient.name.trim() && newClient.email.trim();
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
      existingClientId: existingClientId || undefined,
      milestones: milestones.filter((m) => m.title.trim()).map((m) => ({ title: m.title.trim(), dueDate: m.dueDate || undefined })),
      newClient: hasNewClient
        ? { name: newClient.name.trim(), email: newClient.email.trim(), company: newClient.company.trim() || undefined }
        : undefined,
      sendInvite: sendInvite && Boolean(existingClientId || hasNewClient),
    };
    startTransition(async () => {
      const res = await createProjectWizardAction(payload);
      if (res?.error) setError(res.error);
    });
  }

  const willInviteName = selectedClient?.label ?? (newClient.name.trim() || null);

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2 text-[13px]">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full text-2xs font-semibold",
                i < step ? "bg-success text-white" : i === step ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={cn(i === step ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {i < STEPS.length - 1 ? <span className="mx-1 h-px w-6 bg-border" /> : null}
          </li>
        ))}
      </ol>

      {/* Step 1 - Details */}
      {step === 0 ? (
        <div className="space-y-4">
          <label className="block">
            <Label>Project name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Redesign" autoFocus />
          </label>
          <label className="block">
            <Label>Client</Label>
            <select
              value={existingClientId}
              onChange={(e) => setExistingClientId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose later / add a new one</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this project about?"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="block">
              <Label>Target completion</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </label>
          </div>
        </div>
      ) : null}

      {/* Step 2 - Milestones */}
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-[13px] text-muted-foreground">Add the key stages. You can skip this and add them later.</p>
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={m.title}
                onChange={(e) =>
                  setMilestones((ms) => ms.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                }
                placeholder={`Milestone ${i + 1}`}
              />
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) =>
                  setMilestones((ms) => ms.map((x, j) => (j === i ? { ...x, dueDate: e.target.value } : x)))
                }
                className="h-9 w-40 shrink-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                onClick={() => setMilestones((ms) => ms.filter((_, j) => j !== i))}
                className="shrink-0 rounded-md px-2 py-1 text-2xs text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Remove milestone"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => setMilestones((ms) => [...ms, { title: "", dueDate: "" }])}
            className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            + Add milestone
          </button>
        </div>
      ) : null}

      {/* Step 3 - Invite client */}
      {step === 2 ? (
        <div className="space-y-4">
          {selectedClient ? (
            <p className="text-[13px] text-muted-foreground">
              This project is for <span className="font-medium text-foreground">{selectedClient.label}</span>.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">Add the client for this project (optional).</p>
              <label className="block">
                <Label>Client name</Label>
                <Input
                  value={newClient.name}
                  onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Sarah Whitfield"
                />
              </label>
              <label className="block">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))}
                  placeholder="sarah@company.com"
                />
              </label>
              <label className="block">
                <Label>Company</Label>
                <Input
                  value={newClient.company}
                  onChange={(e) => setNewClient((c) => ({ ...c, company: e.target.value }))}
                  placeholder="Northstar Ltd"
                />
              </label>
            </div>
          )}
          {willInviteName ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="size-4" />
              <span className="text-[13px]">Send {willInviteName} a portal invitation when the project is created</span>
            </label>
          ) : null}
        </div>
      ) : null}

      {/* Step 4 - Review */}
      {step === 3 ? (
        <div className="space-y-3 rounded-lg border border-border p-4 text-[13px]">
          <Row label="Project" value={name || "-"} />
          <Row label="Client" value={willInviteName ?? "None yet"} />
          <Row label="Target" value={targetDate || "Not set"} />
          <Row
            label="Milestones"
            value={milestones.filter((m) => m.title.trim()).map((m) => m.title).join(", ") || "None"}
          />
          <Row label="Invite" value={willInviteName && sendInvite ? `Email ${willInviteName}` : "Not now"} />
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-[13px] text-danger">{error}</p>
      ) : null}

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={back} disabled={step === 0 || pending}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={next} disabled={step === 0 && !name.trim()}>
            {step === 1 || step === 2 ? "Continue" : "Next"}
          </Button>
        ) : (
          <Button size="sm" onClick={submit} disabled={pending || !name.trim()}>
            {pending ? "Creating…" : "Create project"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
