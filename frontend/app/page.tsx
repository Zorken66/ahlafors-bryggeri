import type { ReactNode } from "react";

import Hero from "@/components/Hero";
import About from "@/components/About";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewsSection from "@/components/NewsSection";
import Services from "@/components/Services";
import CallToAction from "@/components/CallToAction";
import { getPublishedNews, getPublishedProducts, getPublishedServices } from "@/lib/published-content";
import { getHomepageFeaturedProducts } from "@/lib/product-utils";
import { readSiteContent } from "@/lib/content-store";
import type { HomepageSectionId } from "@/lib/content-schema";

export default async function Home() {
  const content = await readSiteContent();
  const publishedProducts = getPublishedProducts(content.products);
  const publishedNews = getPublishedNews(content.news);
  const publishedServices = getPublishedServices(content.services);
  const featuredHomepageProducts = getHomepageFeaturedProducts(content.site, publishedProducts);

  const sections: Record<HomepageSectionId, ReactNode> = {
    hero: <Hero homepage={content.homepage} />,
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
        news={publishedNews}
        title={content.homepage.newsTitle}
        intro={content.homepage.newsIntro}
        ctaLabel={content.homepage.newsCtaLabel}
      />
    ),
    services: (
      <Services
        services={publishedServices.slice(0, 3)}
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
