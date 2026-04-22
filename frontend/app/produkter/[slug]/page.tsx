import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCmsSession } from "@/lib/cms-auth";
import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";
import { getPublishedProducts } from "@/lib/published-content";
import { buildOpenGraphMetadata, withAbsoluteUrl } from "@/lib/site-metadata";
import { findProductBySlug, getRelatedProducts } from "@/lib/product-utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const session = preview ? await getCmsSession() : null;
  const { products, productDetailPage, site } = await readSiteContent();
  const productSource = preview && session ? products : getPublishedProducts(products);
  const product = findProductBySlug(productSource, slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(getPublishedProducts(products), product.id, product.relatedProductIds);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [withAbsoluteUrl(product.ogImage || product.image)],
    category: product.category,
    sku: product.artikelnummer || product.id,
    brand: {
      "@type": "Brand",
      name: "Ahlafors Bryggerier",
    },
    offers: product.links.map((link) => ({
      "@type": "Offer",
      url: link.url,
      seller: {
        "@type": "Organization",
        name: link.label,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }}></div>
        <div className="absolute inset-0" style={buildHeroOverlayStyle(productDetailPage.heroOverlayOpacity)}></div>
        <div className="relative container-custom py-24">
          <Link href="/produkter" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white hover:text-white">
            {productDetailPage.backLinkLabel}
          </Link>
          <div className="mt-8 max-w-3xl">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">{product.style}</div>
            <h1 className="text-5xl font-bold tracking-tight text-white">{product.name}</h1>
            <p className="mt-6 text-lg leading-8 text-stone-200">{product.description}</p>
            {preview && session && (
              <div className="mt-6 inline-flex rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-950">
                Förhandsvisning av utkast
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_360px]">
          <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
            <div className="h-96 bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }}></div>
            <div className="space-y-6 p-8">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-stone-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Typ</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{product.type}</div>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Alkohol</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{product.alcohol}</div>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Volym</div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{product.volume}</div>
                </div>
                <div className="rounded-2xl bg-stone-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Kategori</div>
                  <div className="mt-2 text-lg font-semibold capitalize text-stone-900">{product.category}</div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-900">{productDetailPage.descriptionHeading}</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-stone-700">{product.fullDescription}</p>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold text-stone-900">{productDetailPage.linksHeading}</h2>
              <div className="mt-4 space-y-3">
                {product.links.map((link) => (
                  <a
                    key={`${product.id}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl bg-amber-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-amber-700"
                  >
                    <span>{link.label}</span>
                    <span>{productDetailPage.linkActionLabel}</span>
                  </a>
                ))}
                {product.links.length === 0 && (
                  <p className="text-sm text-stone-500">{productDetailPage.linksEmptyText}</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold text-stone-900">{productDetailPage.dataHeading}</h2>
              <dl className="mt-4 space-y-3 text-sm text-stone-700">
                {product.artikelnummer && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-stone-500">{productDetailPage.articleNumberLabel}</dt>
                    <dd>{product.artikelnummer}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-stone-500">{productDetailPage.publishedLabel}</dt>
                  <dd>{product.publishedAt || "Direkt"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-stone-500">{productDetailPage.relatedCountLabel}</dt>
                  <dd>{relatedProducts.length}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="pb-20">
          <div className="container-custom">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">{productDetailPage.relatedEyebrow}</p>
                <h2 className="mt-2 text-3xl font-bold text-stone-900">{productDetailPage.relatedTitle}</h2>
              </div>
              <Link href="/produkter" className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900">
                {productDetailPage.allProductsLabel}
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <article key={relatedProduct.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
                  <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url('${relatedProduct.image}')` }}></div>
                  <div className="space-y-4 p-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{relatedProduct.style}</div>
                    <h3 className="text-2xl font-bold text-stone-900">{relatedProduct.name}</h3>
                    <p className="text-sm leading-7 text-stone-600">{relatedProduct.description}</p>
                    <Link href={`/produkter/${relatedProduct.slug}`} className="inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-500">
                      {productDetailPage.viewProductLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const session = preview ? await getCmsSession() : null;
  const { products, site } = await readSiteContent();
  const product = findProductBySlug(preview && session ? products : getPublishedProducts(products), slug);

  if (!product) {
    return {
      title: `${site.companyName} - Produkt`,
    };
  }

  return buildOpenGraphMetadata({
    title: product.seoTitle || `${product.name} - ${site.companyName}`,
    description: product.seoDescription || product.description,
    url: `/produkter/${product.slug}`,
    image: product.ogImage || product.image || site.ogImage,
  });
}
