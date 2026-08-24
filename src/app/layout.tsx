import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ConsentBanner } from "@/components/marketing/consent-banner";
import { MotionLayer } from "@/components/marketing/motion-layer";
import { AttributionCapture } from "@/components/marketing/attribution-capture";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const appUrl = host ? `${protocol}://${host}` : process.env.APP_URL ?? "https://useclientfold.com";
  const socialImage = new URL("/opengraph-image", appUrl).toString();
  return {
  metadataBase: new URL(appUrl),
  title: {
    default: "ClientFold — Client work without the chase",
    template: "%s · ClientFold",
  },
  description:
    "Keep approvals, files and invoices moving with a client portal that sends polite follow-ups automatically.",
  applicationName: "ClientFold",
  openGraph: {
    type: "website",
    siteName: "ClientFold",
    title: "Client work. Without the chase.",
    description:
      "A client portal for approvals, files and invoices—with polite follow-ups that send themselves.",
    url: appUrl,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client work. Without the chase.",
    description: "A client portal for approvals, files and invoices—with polite follow-ups that send themselves.",
    images: [socialImage],
  },
  robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <AttributionCapture />
        <MotionLayer />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
