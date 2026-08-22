import type { Metadata } from "next";
import "./globals.css";
import { ConsentBanner } from "@/components/marketing/consent-banner";
import { MotionLayer } from "@/components/marketing/motion-layer";

const APP_URL = process.env.APP_URL ?? "https://clientfold.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ClientFold — The calm layer for client work",
    template: "%s · ClientFold",
  },
  description:
    "A clear shared workspace for client projects, approvals, files, updates and payments.",
  applicationName: "ClientFold",
  openGraph: {
    type: "website",
    siteName: "ClientFold",
    title: "The calm layer between your team and your clients.",
    description:
      "A clear shared workspace for client projects, approvals, files, updates and payments.",
    url: APP_URL,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The calm layer between your team and your clients.",
    description: "One shared workspace for approvals, files, invoices and updates.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <MotionLayer />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
