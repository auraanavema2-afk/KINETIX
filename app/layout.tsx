import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "The Kaizen — Your AI for continuous improvement",
  description: "The first AI platform built on continuous improvement. It learns who you are, remembers everything about you, and gets smarter about you specifically every single day.",
  keywords: ["AI", "personal AI", "kaizen", "continuous improvement", "AI assistant", "India AI"],
  authors: [{ name: "The Kaizen" }],
  openGraph: {
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The first AI platform that knows you and grows with you. Built on the Japanese philosophy of continuous improvement.",
    url: "https://thekaizen.vercel.app",
    siteName: "The Kaizen",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The first AI platform that knows you and grows with you.",
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
