import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://thekaizen.vercel.app"),
  title: "The Kaizen — Your AI for continuous improvement",
  description: "The first AI platform built on continuous improvement. It learns who you are, remembers everything about you, and gets smarter about you specifically every single day.",
  keywords: ["AI", "personal AI", "kaizen", "continuous improvement"],
  authors: [{ name: "The Kaizen" }],
  icons: {
    icon: [{ url: "/images/kaizen-icon.png", type: "image/png" }],
    apple: [{ url: "/images/kaizen-icon.png" }],
  },
  openGraph: {
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The first AI platform that knows you and grows with you.",
    url: "https://thekaizen.vercel.app",
    siteName: "The Kaizen",
    images: [
      {
        url: "/images/kaizen-logo.png",
        width: 1200,
        height: 630,
        alt: "The Kaizen",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Kaizen — Your AI for continuous improvement",
    description: "The first AI platform that knows you and grows with you.",
    images: ["/images/kaizen-logo.png"],
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
