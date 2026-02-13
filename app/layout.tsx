import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import the SpeedInsights component
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// MERGED METADATA SECTION
export const metadata: Metadata = {
  title: "Base Station",
  description: "Tap the base.",
  manifest: "/wallet-manifest.json", // This links the file in /public
  other: {
    "base:app_id": "698042402aafa0bc9ad8a52b",
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
        {/* 2. Add the component here, inside the body */}
        <SpeedInsights />
      </body>
    </html>
  );
} 