import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ahlafors Bryggeri - Hantverk i varje droppe",
  description: "Mikrobryggeri sedan 1854. Upptäck det unika hantverket bakom varje flaska från Ahlafors Bryggeri i Alafors, norr om Göteborg.",
  keywords: ["öl", "bryggeri", "hantverk", "mikrobryggeri", "Alafors", "Göteborg", "cider"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased bg-stone-50 text-stone-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
