import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Coding Intelligence Field Study | Assistants, Models, Orchestration";
const description =
  "An evidence-backed field study of Codex, Claude Code, OpenCode, frontier and open-weight models, neutral harnesses, and distributed AI development.";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";
const imageUrl = new URL(`${basePath}/og.png`, siteOrigin).toString();

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: imageUrl, width: 1717, height: 916 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
