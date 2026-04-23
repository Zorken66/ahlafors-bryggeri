import Link from "next/link";
import ProductImageFrame from "@/components/ProductImageFrame";
import type { SiteContent } from "@/lib/content-schema";
import { isAnniversaryProduct } from "@/lib/product-utils";

export default function FeaturedProducts({
  products,
  title,
  intro,
  ctaLabel,
}: {
  products: SiteContent["products"];
  title: string;
  intro: string;
  ctaLabel: string;
}) {
  return (
    <section className="section-padding bg-stone-100">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">{title}</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            {intro}
          </p>
          <div className="craft-divider"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <ProductImageFrame
                  image={product.image}
                  name={product.name}
                  className="h-full"
                  imageClassName="px-5 pt-5 pb-1 transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-sm font-bold">
                  {product.alcohol}
                </div>
                {isAnniversaryProduct(product) && (
                  <div className="absolute top-4 left-4 rounded-full border border-amber-300/60 bg-stone-950/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 shadow-lg">
                    30 år
                  </div>
                )}
              </div>

              <div className="p-6">
                {isAnniversaryProduct(product) && (
                  <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800">
                    Jubileumsöl
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                  {product.style}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3 text-stone-900">
                  {product.name}
                </h3>
                <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                  {product.description}
                </p>
                <Link 
                  href={`/produkter/${product.slug}`}
                  className="inline-block text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  Läs mer →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/produkter" className="btn-primary">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
