import Link from "next/link";
import type { Metadata } from "next";

import ProductImageFrame from "@/components/ProductImageFrame";
import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";
import { getPublishedProducts } from "@/lib/published-content";
import { getProductCategories, normalizeProducts } from "@/lib/product-utils";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function ProdukterPage({ searchParams }: ProductsPageProps) {
  const { products, productsPage, site } = await readSiteContent();
  const publishedProducts = normalizeProducts(getPublishedProducts(products));
  const categories = getProductCategories(site, publishedProducts);
  const params = await searchParams;
  const activeCategory = categories.some((category) => category.id === params?.category) ? params?.category ?? "alla" : "alla";
  const filteredProducts = activeCategory === "alla"
    ? publishedProducts
    : publishedProducts.filter((product) => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(productsPage.heroOverlayOpacity)}></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${productsPage.heroImage}')`,
          }}
        ></div>

        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{productsPage.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light leading-relaxed">
            {productsPage.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-300">
            {productsPage.heroHighlights.map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-amber-500">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 py-6 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.id === "alla" ? "/produkter" : `/produkter?category=${category.id}`}
                className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? "bg-amber-600 text-white shadow-lg scale-105"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:shadow-md"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-linear-to-b from-stone-50 to-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex h-full flex-col bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-amber-500"
              >
                <div className="relative h-72 overflow-hidden">
                  <ProductImageFrame
                    image={product.image}
                    name={product.name}
                    className="h-full"
                    imageClassName="px-6 pt-5 pb-0 transition-transform duration-500 group-hover:scale-[1.04]"
                  />

                  <div className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {product.alcohol}
                  </div>
                  <div className="absolute top-4 left-4 bg-stone-900/90 text-white px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold shadow-lg">
                    {product.type}
                  </div>

                  {product.featured && (
                    <div className="absolute bottom-4 left-4 bg-amber-500 text-stone-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      Populär
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                    {product.style}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-stone-900 group-hover:text-copper transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {product.fullDescription}
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-stone-200">
                    <div className="text-sm text-stone-700">
                      <div className="font-semibold">{product.volume}</div>
                      {product.artikelnummer && (
                        <div className="text-xs text-stone-400">
                          Art.nr: {product.artikelnummer}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/produkter/${product.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 transition-all hover:border-stone-500"
                      >
                        Läs mer
                      </Link>
                      {product.links[0] && (
                        <a
                          href={product.links[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                        >
                          {product.links[0].label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500 shadow-lg">
              {productsPage.emptyStateText}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">{productsPage.ctaTitle}</h2>
          <p className="text-xl mb-8">{productsPage.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={productsPage.ctaPrimaryLink} className="btn-primary">
              {productsPage.ctaPrimaryLabel}
            </Link>
            <Link href={productsPage.ctaSecondaryLink} className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              {productsPage.ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { productsPage, site } = await readSiteContent();
  return {
    title: productsPage.seoTitle || `${site.companyName} - Produkter`,
    description: productsPage.seoDescription || site.metadataDescription,
    alternates: {
      canonical: "/produkter",
    },
    openGraph: {
      title: productsPage.seoTitle || `${site.companyName} - Produkter`,
      description: productsPage.seoDescription || site.metadataDescription,
      images: site.ogImage ? [{ url: site.ogImage }] : undefined,
    },
  };
}
