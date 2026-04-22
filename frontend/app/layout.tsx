import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { readSiteContent } from "@/lib/content-store";
import { getCanonicalBase, withAbsoluteUrl } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

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

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();

  return {
    title: content.site.metadataTitle,
    description: content.site.metadataDescription,
    keywords: content.site.metadataKeywords,
    metadataBase: new URL(content.site.canonicalUrl || getCanonicalBase()),
    alternates: {
      canonical: content.site.canonicalUrl || getCanonicalBase(),
    },
    openGraph: {
      title: content.site.metadataTitle,
      description: content.site.metadataDescription,
      url: content.site.canonicalUrl || getCanonicalBase(),
      images: content.site.ogImage ? [{ url: withAbsoluteUrl(content.site.ogImage) }] : undefined,
    },
  };
}

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
