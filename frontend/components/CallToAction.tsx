import Link from "next/link";

import type { SiteContent } from "@/lib/content-schema";

export default function CallToAction({ homepage }: { homepage: SiteContent["homepage"] }) {
  return (
    <section className="section-padding bg-stone-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}>
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-6">
            {homepage.ctaTitle}
          </h2>
          
          <p className="text-xl mb-4 text-stone-300">
            {homepage.ctaLead}
          </p>
          
          <p className="text-lg mb-12 text-stone-400">
            {homepage.ctaBody}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href={homepage.ctaPrimaryLink} className="btn-primary">
              {homepage.ctaPrimaryLabel}
            </Link>
            <Link href={homepage.ctaSecondaryLink} className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              {homepage.ctaSecondaryLabel}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-stone-700">
            {homepage.ctaCards.map((card) => (
              <div key={`${card.title}-${card.icon}`}>
                <div className="text-amber-400 text-5xl mb-4">{card.icon}</div>
                <h3 className="font-serif font-bold text-xl mb-2">{card.title}</h3>
                <p className="text-stone-400">
                  {card.lines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
