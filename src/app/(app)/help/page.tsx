import { PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Help" };

const ITEMS = [
  { q: "How do clients log in?", a: "Clients receive a secure magic link. No password or signup required." },
  { q: "What is the Waiting Room?", a: "One screen showing everything still sitting with a client — approvals, files, payments and replies." },
  { q: "How do approvals work?", a: "Send a version, the client approves or requests changes, and every decision is recorded immutably." },
  { q: "Can I use my own domain?", a: "Yes — Studio and Agency plans support a custom portal domain like portal.yourstudio.com." },
];

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="Help" description="Answers to the common questions." />
      <div className="p-6">
        <div className="mx-auto max-w-2xl divide-y divide-border rounded-lg border border-border">
          {ITEMS.map((i) => (
            <div key={i.q} className="px-5 py-4">
              <div className="text-sm font-medium">{i.q}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{i.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
