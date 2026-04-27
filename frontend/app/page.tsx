import type { ReactNode } from "react";

import Hero from "@/components/Hero";
import AnniversarySection from "@/components/AnniversarySection";
import About from "@/components/About";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewsSection from "@/components/NewsSection";
import Services from "@/components/Services";
import CallToAction from "@/components/CallToAction";
import { getCmsSession } from "@/lib/cms-auth";
import { getVisibleNews, getVisibleProducts, getVisibleServices } from "@/lib/published-content";
import { getHomepageFeaturedProducts } from "@/lib/product-utils";
import { readSiteContent } from "@/lib/content-store";
import type { HomepageSectionId } from "@/lib/content-schema";

type HomePageProps = {
  searchParams?: Promise<{ preview?: string; newsId?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const preview = resolvedSearchParams?.preview === "1";
  const selectedNewsId = resolvedSearchParams?.newsId;
  const session = preview ? await getCmsSession() : null;
  const content = await readSiteContent();
  const visibleProducts = getVisibleProducts(content.products, { preview, hasSession: Boolean(session) });
  const visibleNews = getVisibleNews(content.news, { preview, hasSession: Boolean(session) });
  const visibleServices = getVisibleServices(content.services, { preview, hasSession: Boolean(session) });
  const featuredHomepageProducts = getHomepageFeaturedProducts(content.site, visibleProducts);

  const sections: Record<HomepageSectionId, ReactNode> = {
    hero: <Hero homepage={content.homepage} />,
    anniversary: <AnniversarySection homepage={content.homepage} />,
    about: <About about={content.about} />,
    products: (
      <FeaturedProducts
        products={featuredHomepageProducts}
        title={content.homepage.productsTitle}
        intro={content.homepage.productsIntro}
        ctaLabel={content.homepage.productsCtaLabel}
      />
    ),
    news: (
      <NewsSection
        news={visibleNews}
        title={content.homepage.newsTitle}
        intro={content.homepage.newsIntro}
        ctaLabel={content.homepage.newsCtaLabel}
        preview={preview && Boolean(session)}
        highlightedId={selectedNewsId}
      />
    ),
    services: (
      <Services
        services={visibleServices.slice(0, 3)}
        title={content.homepage.servicesTitle}
        intro={content.homepage.servicesIntro}
      />
    ),
    cta: <CallToAction homepage={content.homepage} />,
  };

  return (
    <div className="min-h-screen">
      {content.homepage.sectionOrder
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.id}>
            {sections[section.id]}
          </div>
        ))}
    </div>
  );
}
