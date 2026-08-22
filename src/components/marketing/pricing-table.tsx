import { PLANS } from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingTable() {
  return (
    <div className="grid gap-px border border-[#d3d2cb] bg-[#d3d2cb] md:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan, index) => (
        <div
          key={plan.key}
          data-reveal="soft"
          style={{ transitionDelay: `${index * 65}ms` }}
          className={cn(
            "relative flex min-h-[430px] flex-col border-0 bg-[#f7f6f1] p-6",
            plan.featured && "bg-[#eeefe8]",
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{plan.name}</h3>
            {plan.featured ? (
              <span className="rounded-full bg-[#dfe4da] px-2 py-0.5 text-[9px] font-medium text-[#566151]">
                Popular
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-medium tracking-[-0.035em]">£{plan.price}</span>
            <span className="text-sm text-muted-foreground">{plan.cadence}</span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">{plan.tagline}</p>
          <ButtonLink
            href={`/waitlist?plan=${plan.key}`}
            variant={plan.featured ? "primary" : "outline"}
            size="sm"
            className="mt-5 w-full"
          >
            {plan.cta}
          </ButtonLink>
          <ul className="mt-5 space-y-2 text-[13px]">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted-foreground">
                <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden>
                  <path
                    d="M13 4.5 6.5 11 3 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
