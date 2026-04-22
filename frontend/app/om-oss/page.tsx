import Link from "next/link";

import type { Metadata } from "next";

import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";

export default async function OmOssPage() {
  const { about } = await readSiteContent();

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(about.pageHeroOverlayOpacity)}></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${about.pageHeroImage}')`
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{about.pageHeroTitle}</h1>
          <p className="text-xl md:text-2xl text-amber-400 font-serif italic">
            {about.pageHeroSubtitle}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="heading-md mb-6">{about.historyTitle}</h2>
              <div className="space-y-4 text-stone-700 leading-relaxed">
                {about.historyParagraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index === 0 ? "text-lg" : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative h-96 rounded-none overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${about.historyImage}')`
                }}
              ></div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {about.stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-stone-100">
                <div className="text-5xl font-bold text-amber-700 mb-2">{stat.value}</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="heading-md mb-8 text-center">{about.craftTitle}</h2>
            
            <div className="bg-amber-50 border-l-4 border-amber-600 p-8 mb-8">
              <p className="text-lg text-amber-900 italic">
                {about.craftLead}
              </p>
            </div>

            <div className="space-y-6 text-stone-700 leading-relaxed">
              <div>
                <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Ingredienser</h3>
                <ul className="space-y-2">
                  {about.ingredients.map((ingredient) => (
                    <li key={ingredient} className="flex items-start gap-3">
                      <span className="text-amber-600">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Distribution</h3>
                {about.distributionParagraphs.map((paragraph, index) => (
                  <p key={paragraph} className={index > 0 ? "mt-4" : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">{about.locationTitle}</h2>
          <p className="text-xl mb-4">{about.locationLead}</p>
          <p className="text-lg text-stone-300 mb-8">{about.locationSublead}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rulleriet" className="btn-primary">
              Besök Rulleriet
            </Link>
            <Link href="/produkter" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              Se våra produkter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { about, site } = await readSiteContent();
  return {
    title: about.seoTitle || `${site.companyName} - Om oss`,
    description: about.seoDescription || site.metadataDescription,
  };
}
