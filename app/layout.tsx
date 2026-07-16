import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "devpulse.ai";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "DevPulse AI — AI-Native Incident Resolution",
      template: "%s | DevPulse AI",
    },
    description:
      "Resolve production incidents with deterministic AI diagnostics, source-level context, and self-healing patch agents.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Stop Searching Logs. Let AI Fix the Outage.",
      description:
        "AI-native observability that turns production telemetry into verified hotfixes.",
      type: "website",
      siteName: "DevPulse AI",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "DevPulse AI turns a production incident into a verified patch." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "DevPulse AI",
      description:
        "AI-native observability that turns production telemetry into verified hotfixes.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
