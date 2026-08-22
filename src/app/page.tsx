import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ProductTour } from "@/components/marketing/product-tour";
import { ScrollFeatureStory } from "@/components/marketing/scroll-feature-story";
import { ButtonLink } from "@/components/ui/button";

const waitingRows = [
  ["Northstar Ltd", "Homepage design", "Approval", "4d"],
  ["Atlas Coffee", "Brand assets", "Files", "5d"],
  ["Bright Labs", "INV–108", "Payment", "3d"],
  ["Northstar Ltd", "Homepage copy", "Task", "2d"],
];

const capabilityGroups = [
  {
    number: "01",
    label: "Plan",
    summary: "Turn a new engagement into a clear path from kickoff to completion.",
    features: [
      { title: "Project timelines", body: "Map phases, milestones and the client actions that unlock each step.", status: "Next" },
      { title: "Reusable workflows", body: "Start repeatable client work from a proven process instead of a blank page.", status: "Next" },
      { title: "Client health", body: "See momentum, overdue actions and risk across every active project.", status: "In beta" },
    ],
  },
  {
    number: "02",
    label: "Gather",
    summary: "Collect the right words, files and context before they become a blocker.",
    features: [
      { title: "Smart file requests", body: "Ask for exact assets and keep every upload attached to the right project.", status: "In beta" },
      { title: "Guided client intake", body: "Give clients a focused checklist for content, access and project details.", status: "Next" },
      { title: "Shared project inbox", body: "Keep client messages close to the work without losing the email habit.", status: "In beta" },
    ],
  },
  {
    number: "03",
    label: "Review",
    summary: "Make feedback precise and turn every sign-off into a durable decision.",
    features: [
      { title: "Visual comments", body: "Pin feedback directly to an image so there is no doubt about what should change.", status: "In beta" },
      { title: "Versioned approvals", body: "Send the right version and capture a clear, timestamped approval.", status: "In beta" },
      { title: "Decision history", body: "Keep comments, changes and sign-offs together as the project record.", status: "In beta" },
    ],
  },
  {
    number: "04",
    label: "Close",
    summary: "Deliver professionally, collect payment and leave the client with a complete record.",
    features: [
      { title: "Branded client portals", body: "Give each client one calm, focused home for everything that needs them.", status: "In beta" },
      { title: "Invoices and Stripe", body: "Send project-linked invoices and let clients pay without leaving the portal.", status: "In beta" },
      { title: "Weekly client digest", body: "Bundle progress, decisions and next actions into one useful update.", status: "Next" },
    ],
  },
] as const;

function HeroWorkspace() {
  return (
    <div className="relative min-w-0">
      <div className="absolute -right-3 -top-3 hidden h-24 w-24 border-r border-t border-[#aeb1a7] sm:block" aria-hidden />
      <div className="overflow-hidden rounded-[14px] border border-[#c9c9c0] bg-[#fbfbf7] shadow-[0_35px_90px_-50px_rgba(35,39,31,0.65)]">
        <div className="flex h-12 items-center justify-between border-b border-[#dcdbd4] px-4 text-[10px] text-[#777970] sm:px-5">
          <div className="flex items-center gap-3"><span className="flex size-6 items-center justify-center rounded bg-[#566151] text-[9px] font-semibold text-white">N</span><b className="text-[#31342d]">Northline Studio</b><span className="hidden text-[#b0b1aa] sm:inline">/</span><span className="hidden sm:inline">Workspace</span></div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#718069]" /> Friday, 22 August</div>
        </div>
        <div className="grid min-h-[430px] grid-cols-[48px_1fr] sm:grid-cols-[154px_1fr] lg:grid-cols-[170px_1fr_230px]">
          <aside className="border-r border-[#dfded8] bg-[#efeee8] p-2.5 sm:p-3">
            <div className="hidden space-y-1 text-[10px] text-[#777970] sm:block">
              {["Overview", "Projects", "Waiting room", "Files", "Invoices"].map((item, index) => (
                <div key={item} className={`flex items-center gap-2 rounded-md px-2.5 py-2.5 ${index === 2 ? "bg-[#fbfbf7] font-medium text-[#2e312a] shadow-xs" : ""}`}>
                  <span className={`size-1.5 rounded-full ${index === 2 ? "bg-[#687361]" : "bg-[#c5c6bf]"}`} />{item}
                  {index === 2 ? <span className="ml-auto rounded-full bg-[#e3e6df] px-1.5 py-0.5 text-[8px] text-[#596453]">7</span> : null}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 pt-1 sm:hidden">
              {[0, 1, 2, 3, 4].map((item) => <span key={item} className={`size-1.5 rounded-full ${item === 2 ? "bg-[#687361]" : "bg-[#c5c6bf]"}`} />)}
            </div>
          </aside>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[9px] uppercase tracking-[0.14em] text-[#8a8c83]">What needs attention</p><h2 className="mt-1.5 text-xl font-medium tracking-[-0.025em] text-[#2d3029]">Waiting room</h2></div>
              <div className="border border-[#dcdbd5] px-2.5 py-1.5 text-[9px] text-[#65675f]">7 open items</div>
            </div>
            <div className="mt-6 grid grid-cols-3 border-y border-[#e0dfda] py-3.5">
              {[["£8,420", "Outstanding"], ["2", "Approvals"], ["1", "File request"]].map(([value, label]) => <div key={label} className="border-r border-[#e0dfda] px-3 first:pl-0 last:border-0"><div className="text-sm font-semibold text-[#2d3029]">{value}</div><div className="mt-0.5 truncate text-[8px] uppercase tracking-wide text-[#8a8c83]">{label}</div></div>)}
            </div>
            <div className="mt-2 divide-y divide-[#e6e5e0]">
              {waitingRows.map(([client, item, type, time], index) => <div key={item} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-[10px] sm:grid-cols-[1fr_1.15fr_auto_auto] sm:items-center"><span className="text-[#777970]">{client}</span><span className="hidden font-medium text-[#363931] sm:block">{item}</span><span className={`rounded-full px-2 py-1 text-[8px] ${index === 0 ? "bg-[#dfe4da] text-[#566151]" : "bg-[#ecece6] text-[#65685f]"}`}>{type}</span><span className="text-right tabular-nums text-[#777970]">{time}</span></div>)}
            </div>
          </div>
          <aside className="hidden border-l border-[#dfded8] bg-[#f4f3ee] p-5 lg:flex lg:flex-col">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a8c83]">Up next</p>
            <div className="mt-4 border-l-2 border-[#6f7a68] pl-3"><p className="text-xs font-medium text-[#34372f]">Homepage v3</p><p className="mt-1 text-[9px] leading-4 text-[#7a7c74]">Sarah has opened the approval twice.</p></div>
            <div className="mt-6 border-t border-[#dfded8] pt-4"><div className="flex items-center justify-between text-[9px] text-[#7a7c74]"><span>Project progress</span><span>67%</span></div><div className="mt-2 h-1 bg-[#dedfd8]"><div className="h-full w-2/3 bg-[#63705d]" /></div></div>
            <div className="mt-auto border border-[#d8d7d0] bg-[#fbfbf7] p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-[#8a8c83]">Next milestone</p><p className="mt-2 text-xs font-medium text-[#34372f]">Development</p><p className="mt-1 text-[9px] leading-4 text-[#7a7c74]">Opens when the homepage is approved.</p></div>
          </aside>
        </div>
      </div>
      <div className="absolute -bottom-5 left-5 hidden items-center gap-3 border border-[#d1d1c9] bg-[#fbfbf7] px-3.5 py-2.5 shadow-[0_12px_35px_-18px_rgba(35,39,31,0.5)] sm:flex">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#dfe4da] text-xs text-[#596453]">✓</span>
        <span><span className="block text-[10px] font-medium text-[#34372f]">Homepage v3 approved</span><span className="text-[8px] text-[#84867e]">Sarah · just now</span></span>
      </div>
    </div>
  );
}

function SystemMap() {
  const cards = [
    { label: "Approval", value: "Homepage v3", meta: "Approved", place: "md:col-start-1 md:row-start-1" },
    { label: "File request", value: "Brand assets", meta: "3 files added", place: "md:col-start-3 md:row-start-1" },
    { label: "Invoice", value: "INV–108", meta: "£2,400 due", place: "md:col-start-1 md:row-start-3" },
    { label: "Update", value: "Mobile layouts", meta: "Sent today", place: "md:col-start-3 md:row-start-3" },
  ];
  return (
    <div className="relative grid gap-3 md:grid-cols-[1fr_1.05fr_1fr] md:grid-rows-[1fr_1fr_1fr]">
      <div className="absolute left-1/2 top-1/2 hidden h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 border border-dashed border-[#c8c9c1] md:block" />
      {cards.map((card) => (
        <div key={card.label} data-reveal="soft" className={`relative z-10 border border-[#d6d5ce] bg-[#fbfbf8] p-4 ${card.place}`}>
          <div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[0.13em] text-[#8a8c83]">{card.label}</span><span className="size-1.5 rounded-full bg-[#78846f]" /></div>
          <p className="mt-4 text-sm font-medium text-[#33362f]">{card.value}</p><p className="mt-1 text-[9px] text-[#7e8078]">{card.meta}</p>
        </div>
      ))}
      <div data-reveal className="relative z-20 flex min-h-40 flex-col items-center justify-center bg-[#566151] p-6 text-center text-white md:col-start-2 md:row-start-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold">NS</span><p className="mt-3 text-sm font-medium">Northstar Ltd</p><p className="mt-1 text-[9px] text-white/55">One client portal · Always current</p>
      </div>
    </div>
  );
}

function CapabilityAtlas() {
  return (
    <section id="capabilities" className="border-b border-[#d9d8d2] bg-[#f3f2ed] py-20 sm:py-28">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div data-reveal="soft">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The product map</p>
            <h2 className="mt-4 max-w-lg text-balance text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
              From first brief to final payment.
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-6 border-l border-[#cbcac3] pl-5 sm:flex-row sm:items-end lg:pl-8" data-reveal="soft">
            <p className="max-w-md text-sm leading-6 text-[#6f7169]">
              Twelve connected capabilities, planned around the real rhythm of client work—not a pile of tools your team has to stitch together.
            </p>
            <div className="flex shrink-0 items-center gap-4 text-[9px] uppercase tracking-[0.12em] text-[#7c7e76]">
              <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#667260]" /> In beta</span>
              <span className="flex items-center gap-2"><span className="size-1.5 rounded-full border border-[#969a90]" /> Next</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-l border-t border-[#d0cfc8]">
          {capabilityGroups.map((group, groupIndex) => (
            <div key={group.label} className="grid border-b border-[#d0cfc8] lg:grid-cols-[0.52fr_1.48fr]">
              <div className="flex min-h-48 flex-col justify-between border-r border-[#d0cfc8] p-5 sm:p-6 lg:min-h-64">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#999b93]">{group.number}</span>
                  <span className="text-[9px] uppercase tracking-[0.13em] text-[#697363]">Stage</span>
                </div>
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.03em] text-[#30332c]">{group.label}</h3>
                  <p className="mt-3 max-w-xs text-[11px] leading-5 text-[#777970]">{group.summary}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3">
                {group.features.map((feature, featureIndex) => (
                  <article
                    key={feature.title}
                    data-reveal="soft"
                    style={{ transitionDelay: `${(groupIndex * 35) + (featureIndex * 65)}ms` }}
                    className="flex min-h-52 flex-col border-b border-r border-[#d0cfc8] p-5 last:border-b-0 sm:min-h-64 sm:border-b-0 sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#a0a29a]">{group.number}.{featureIndex + 1}</span>
                      <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-[#85877f]">
                        <span className={`size-1.5 rounded-full ${feature.status === "In beta" ? "bg-[#667260]" : "border border-[#969a90]"}`} />
                        {feature.status}
                      </span>
                    </div>
                    <div className="mt-auto pt-12">
                      <h4 className="text-sm font-medium text-[#363931]">{feature.title}</h4>
                      <p className="mt-2 max-w-[15rem] text-[11px] leading-5 text-[#777970]">{feature.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-4 border-b border-l border-r border-[#d0cfc8] bg-[#eeede7] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs font-medium text-[#43463e]">One system, so every client action moves the whole project forward.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] uppercase tracking-[0.12em] text-[#7f8179]">
            <span>Plan</span><span>Gather</span><span>Review</span><span>Close</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#292b26]">
      <SiteNav />
      <main>
        <section className="overflow-hidden border-b border-[#d9d8d2] bg-[#f3f2ed]">
          <div className="container pb-20 pt-14 lg:pb-24 lg:pt-20">
            <div className="grid gap-8 lg:grid-cols-[1.28fr_0.72fr] lg:items-end" data-reveal="soft">
              <div>
                <Link href="#product" className="inline-flex items-center gap-2 border-b border-[#949c8d] pb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#56604f]"><span className="size-1.5 rounded-full bg-[#64705c]" /> Built for client-facing work</Link>
                <h1 className="mt-7 max-w-[820px] text-balance text-[3.25rem] font-medium leading-[0.94] tracking-[-0.06em] text-[#242620] sm:text-[5.2rem] lg:text-[6rem]">Client work,<br/><span className="font-editorial font-normal italic tracking-[-0.045em] text-[#5d6857]">without the chase.</span></h1>
              </div>
              <div className="border-l border-[#cfcec7] pl-5 lg:mb-2 lg:pl-7">
                <p className="max-w-sm text-pretty text-[15px] leading-7 text-[#666860]">One shared place for every update, file, approval and invoice—so your team knows what is moving, and clients know exactly what to do next.</p>
                <div className="mt-6 flex flex-wrap items-center gap-3"><ButtonLink href="/waitlist" size="lg" className="bg-[#242620] px-6 hover:bg-[#3b3d36]">Join the waitlist</ButtonLink><ButtonLink href="/demo" size="lg" variant="outline" className="border-[#bfc0b8] bg-transparent px-6 hover:bg-white/60">Try the demo <span aria-hidden>→</span></ButtonLink></div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-[#84867e]">Private beta · No card required</p>
              </div>
            </div>
            <div className="mt-14" data-reveal><HeroWorkspace /></div>
            <div className="mt-9 flex flex-wrap items-center justify-between gap-4 text-[9px] uppercase tracking-[0.14em] text-[#85877f]"><span>One source of truth for the whole project</span><span className="text-[#596453]">Approvals · Files · Messages · Payments</span></div>
          </div>
        </section>

        <section className="border-b border-[#d9d8d2]">
          <div className="container grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="border-[#d9d8d2] py-20 lg:border-r lg:pr-16">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">The shared picture</p><h2 className="mt-5 max-w-md text-balance text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl">Every loose end, folded into one place.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#73756d]">ClientFold connects the work your team manages with the few clear actions your client needs to take.</p>
              <div className="mt-10 space-y-5 border-t border-[#d9d8d2] pt-6">{[["01", "Your team sees what is moving and what is blocked."], ["02", "Clients see only what needs their attention."], ["03", "Every decision becomes part of the project record."]].map(([n, text]) => <div key={n} className="grid grid-cols-[32px_1fr] gap-3 text-xs leading-5"><span className="font-mono text-[9px] text-[#9a9b94]">{n}</span><span className="text-[#555850]">{text}</span></div>)}</div>
            </div>
            <div className="py-12 lg:py-20 lg:pl-16"><SystemMap /></div>
          </div>
        </section>

        <ScrollFeatureStory />

        <section id="product" className="border-b border-[#d9d8d2] bg-[#eeede7] py-20 sm:py-28">
          <div className="container">
            <div data-reveal="soft" className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">Inside ClientFold</p><h2 className="mt-4 max-w-xl text-balance text-3xl font-medium tracking-[-0.035em] sm:text-4xl">One workspace. Four views. No detective work.</h2></div><p className="max-w-xs text-xs leading-5 text-[#74766e]">Tap through the product to see how work moves from your desk to the client and back.</p></div>
            <div data-reveal><ProductTour /></div>
          </div>
        </section>

        <CapabilityAtlas />

        <section id="workflow" className="border-b border-[#d9d8d2] py-20 sm:py-28">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
              <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#697363]">A connected workflow</p><h2 className="mt-4 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.035em]">One action keeps the whole project moving.</h2></div>
              <div className="grid border-l border-t border-[#d5d4cd] sm:grid-cols-2 lg:grid-cols-4">
                {[["01", "Send", "Share a design, file request or invoice."], ["02", "Surface", "The client sees one clear next action."], ["03", "Record", "Approval, upload or payment is captured."], ["04", "Move", "The timeline updates and the next step opens."]].map(([n, title, text], index) => <div key={n} data-reveal="soft" style={{ transitionDelay: `${index * 80}ms` }} className="relative min-h-52 border-b border-r border-[#d5d4cd] p-5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[#92948c]">{n}</span><span className={`size-2 ${index === 3 ? "bg-[#667260]" : "border border-[#aeb0a7] bg-[#f7f6f1]"}`} /></div><p className="mt-16 text-sm font-medium text-[#31342d]">{title}</p><p className="mt-2 text-[11px] leading-5 text-[#777970]">{text}</p>{index < 3 && <span className="absolute -right-1.5 top-5 z-10 hidden bg-[#f7f6f1] px-1 text-[#8a8c83] lg:block">→</span>}</div>)}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#d9d8d2] pt-5 text-[9px] uppercase tracking-[0.12em] text-[#85877f]"><span className="text-[#596453]">Always in sync</span><span>Projects</span><span>Approvals</span><span>Files</span><span>Invoices</span><span>Messages</span></div>
          </div>
        </section>

        <section className="bg-[#2d302a] text-[#f5f4ef]">
          <div className="container grid min-h-[430px] lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col justify-between border-white/10 py-16 lg:border-r lg:pr-16 lg:py-20"><p className="text-[10px] uppercase tracking-[0.16em] text-white/45">The client experience, sorted</p><h2 className="mt-16 max-w-xl text-balance text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl">Less chasing.<br/>More momentum.</h2></div>
            <div className="flex flex-col justify-end py-16 lg:pl-16 lg:py-20"><p className="max-w-sm text-sm leading-6 text-white/60">Join the early-access list and be among the first to replace scattered client threads with one calm workspace.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href="/waitlist" size="lg" className="bg-[#f3f2ed] text-[#2d302a] hover:bg-white">Join the waitlist</ButtonLink><ButtonLink href="/demo" size="lg" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">View demo</ButtonLink></div></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
