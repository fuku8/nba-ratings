import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { getLastUpdated } from "@/lib/nba-api";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NBA Ratings | 2025-26 Season",
    template: "%s | NBA Ratings",
  },
  description:
    "NBA team and player net ratings for the 2025-26 season. Offensive, defensive, and net rating analytics with interactive charts.",
};

function Footer() {
  const lastUpdated = getLastUpdated();
  return (
    <footer className="mt-12 border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
      <p>
        Data from Basketball Reference
        {lastUpdated && <span> &middot; Last updated: {lastUpdated} JST</span>}
      </p>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
