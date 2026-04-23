import Link from "next/link";
import type { Metadata } from "next";

import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";
import { getPublishedServices } from "@/lib/published-content";

export default async function TjansterPage() {
  const { services, servicesPage, site } = await readSiteContent();
  const publishedServices = getPublishedServices(services);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(servicesPage.heroOverlayOpacity)}></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${servicesPage.heroImage}')`
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{servicesPage.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            {servicesPage.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-xl text-stone-700 leading-relaxed">
            {servicesPage.introText}
          </p>
        </div>
      </section>

      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {publishedServices.map((service) => (
              <div 
                key={service.id}
                id={service.id}
                className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-t-4 border-amber-600"
              >
                <div className="text-6xl mb-4">{service.icon}</div>
                
                <h2 className="text-3xl font-serif font-bold mb-4 text-stone-900">
                  {service.title}
                </h2>
                
                <p className="text-lg text-stone-600 mb-6">
                  {service.description}
                </p>

                <ul className="space-y-3">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone-700">
                      <span className="text-amber-600 mt-1">✓</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {(service.bodyParagraphs?.length ?? 0) > 0 && (
                  <div className="mt-8 space-y-4 border-t border-stone-200 pt-8 text-stone-700 leading-relaxed">
                    {service.bodyParagraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {service.image && (
                  <figure className="mt-8">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 object-contain"
                    />
                    {service.imageCaption ? (
                      <figcaption className="mt-3 text-center text-sm italic text-stone-500">
                        {service.imageCaption}
                      </figcaption>
                    ) : null}
                  </figure>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">{servicesPage.ctaTitle}</h2>
          <p className="text-xl mb-8">{servicesPage.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={servicesPage.ctaPrimaryLink} className="btn-primary">
              {servicesPage.ctaPrimaryLabel}
            </Link>
            <Link href={servicesPage.ctaSecondaryLink} className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              {servicesPage.ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { servicesPage, site } = await readSiteContent();
  return {
    title: servicesPage.seoTitle || `${site.companyName} - Tjänster`,
    description: servicesPage.seoDescription || site.metadataDescription,
  };
}
