import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://thekaizen.vercel.app"),
  title: {
    default: "The Kaizen — Your AI for continuous improvement",
    template: "%s | The Kaizen",
  },
  description: "The first AI platform built on continuous improvement. The Kaizen learns who you are, remembers everything, and gets smarter about you every single day. Soul memory. Kaizen 4. Mission Control. Pulse. Mint. Kines. Arena. Legacy.",
  keywords: [
    "AI platform",
    "personal AI",
    "kaizen",
    "continuous improvement",
    "AI assistant India",
    "soul memory AI",
    "AI for builders",
    "AI productivity",
    "kaizen AI",
  ],
  authors: [{ name: "The Kaizen" }],
  creator: "The Kaizen",
  publisher: "The Kaizen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/images/kaizen-icon.png", type: "image/png" }],
    apple: [{ url: "/images/kaizen-icon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thekaizen.vercel.app",
    siteName: "The Kaizen",
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The AI that actually knows who you are. Learns you. Remembers you. Gets smarter about you every day.",
    images: [
      {
        url: "/images/kaizen-logo.png",
        width: 1200,
        height: 630,
        alt: "The Kaizen — AI for continuous improvement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The AI that actually knows who you are. Built on the Japanese philosophy of kaizen.",
    images: ["/images/kaizen-logo.png"],
    creator: "@thekaizen",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
