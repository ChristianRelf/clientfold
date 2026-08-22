/**
 * Stripe integration via the REST API (dependency-free, matching the storage +
 * email approach). Supports Stripe Connect: invoice payments are created on the
 * organisation's connected account so funds go to them, not us. When no
 * STRIPE_SECRET_KEY is set we fall back to a local dev simulation so the payment
 * loop is testable end-to-end without live keys.
 */

const API = "https://api.stripe.com/v1";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

/** Encode a nested object as application/x-www-form-urlencoded (Stripe style). */
function formEncode(obj: Record<string, unknown>, prefix = ""): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue;
    const k = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") {
      parts.push(formEncode(value as Record<string, unknown>, k));
    } else {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

async function stripePost(path: string, body: Record<string, unknown>, connectedAccount?: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "content-type": "application/x-www-form-urlencoded",
  };
  // Act on behalf of the connected account (Stripe Connect direct charge).
  if (connectedAccount) headers["Stripe-Account"] = connectedAccount;

  const res = await fetch(`${API}${path}`, { method: "POST", headers, body: formEncode(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Stripe request failed");
  return json;
}

export type CheckoutInput = {
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  amount: number; // minor units
  description: string;
  connectedAccount: string | null;
};

/**
 * Create a Checkout Session for an invoice and return the URL to redirect to.
 * In dev (no keys) returns a simulated checkout page. When a connected account
 * exists the charge is created on it (application fee optional via env).
 */
export async function createInvoiceCheckoutUrl(input: CheckoutInput): Promise<string> {
  if (!isStripeConfigured()) {
    // Dev simulation — a local page that stands in for Stripe Checkout. Return a
    // host-relative path so it resolves against the current request host.
    return `/portal/pay/${input.invoiceId}`;
  }

  const session = await stripePost(
    "/checkout/sessions",
    {
      mode: "payment",
      success_url: `${appUrl()}/portal/invoices?paid=${input.invoiceNumber}`,
      cancel_url: `${appUrl()}/portal/invoices`,
      client_reference_id: input.invoiceId,
      metadata: { invoiceId: input.invoiceId },
      payment_intent_data: { metadata: { invoiceId: input.invoiceId } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amount,
            product_data: { name: input.description },
          },
        },
      ],
    },
    input.connectedAccount ?? undefined,
  );
  return session.url as string;
}

export type SubscriptionCheckoutInput = {
  organisationId: string;
  plan: string;
  planName: string;
  priceMinor: number; // per month, minor units
  currency: string;
  customerEmail?: string | null;
};

/**
 * Start a subscription Checkout for a plan upgrade. Real Stripe uses an inline
 * recurring price (no pre-created Price object needed); dev returns a simulated
 * confirmation page. This is the ClientFold subscription itself (our revenue) —
 * distinct from client invoice payments, which use Connect.
 */
export async function createSubscriptionCheckoutUrl(input: SubscriptionCheckoutInput): Promise<string> {
  if (!isStripeConfigured()) {
    return `/settings/billing/confirm/${input.plan}`;
  }

  const session = await stripePost("/checkout/sessions", {
    mode: "subscription",
    success_url: `${appUrl()}/settings/billing?upgraded=${input.plan}`,
    cancel_url: `${appUrl()}/settings/billing`,
    client_reference_id: input.organisationId,
    customer_email: input.customerEmail ?? undefined,
    metadata: { organisationId: input.organisationId, plan: input.plan },
    subscription_data: { metadata: { organisationId: input.organisationId, plan: input.plan } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.priceMinor,
          recurring: { interval: "month" },
          product_data: { name: `ClientFold ${input.planName}` },
        },
      },
    ],
  });
  return session.url as string;
}

// --- Stripe Connect onboarding ---------------------------------------------

/** Create a connected account + onboarding link. Returns the URL to send the org to. */
export async function createConnectOnboardingUrl(params: {
  organisationId: string;
  existingAccountId: string | null;
  email?: string | null;
  returnPath: string;
}): Promise<{ accountId: string; url: string }> {
  if (!isStripeConfigured()) {
    // Dev simulation handled by the caller (no external call).
    throw new Error("Stripe not configured");
  }

  let accountId = params.existingAccountId;
  if (!accountId) {
    const account = await stripePost("/accounts", {
      type: "express",
      email: params.email ?? undefined,
      metadata: { organisationId: params.organisationId },
    });
    accountId = account.id as string;
  }

  const link = await stripePost("/account_links", {
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${appUrl()}${params.returnPath}`,
    return_url: `${appUrl()}${params.returnPath}?connected=1`,
  });
  return { accountId: accountId!, url: link.url as string };
}
