import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "The Kaizen — Your Second Brain. Built for Builders.",
    template: "%s | The Kaizen",
  },
  description:
    "The first AI platform that actually knows you. Soul memory, goal tracking, app building, and an agent marketplace. All in one dark platform. Built for builders.",
  keywords: [
    "AI platform India",
    "Kaizen 4",
    "The Kaizen",
    "AI assistant India",
    "app builder AI",
    "AI memory",
    "second brain",
    "AI for students",
    "AI for developers",
    "AI for founders",
  ],
  authors: [{ name: "Vema", url: "https://kaizen.ai" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kaizen.ai",
    siteName: "The Kaizen",
    title: "The Kaizen — Your Second Brain. Built for Builders.",
    description:
      "The first AI platform that actually knows you. Soul memory, goal tracking, app building, and an agent marketplace. All in one dark platform. Built for builders.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Kaizen — Your Second Brain. Built for Builders.",
    description:
      "The first AI platform that actually knows you. Soul memory, goal tracking, app building, and an agent marketplace. All in one dark platform. Built for builders.",
    creator: "@kaizenai",
  },
  robots: {
    index: true,
    follow: true,
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
