import Link from "next/link";

import type { SiteContent } from "@/lib/content-schema";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";

export default function Hero({ homepage }: { homepage: SiteContent["homepage"] }) {
  return (
    <section className="relative h-screen flex items-center justify-center bg-stone-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(homepage.heroOverlayOpacity)}></div>
      
      <div className="absolute inset-0 bg-cover bg-center" 
           style={{
             backgroundImage: `url('${homepage.heroBackgroundImage}')`,
             backgroundPosition: "center"
           }}>
      </div>

      <div className="relative z-20 container-custom px-4 text-center">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/18 bg-stone-950/28 px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-[6px] md:px-10 md:py-12">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-amber-300">{homepage.heroEyebrow}</p>
          
          <h1 className="heading-xl mb-6 text-white">
            {homepage.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-stone-100 max-w-3xl mx-auto font-light">
            {homepage.heroLead}
          </p>
          
          <p className="text-lg md:text-xl mb-4 text-amber-300 font-serif italic">
            {homepage.heroTagline}
          </p>

          <p className="text-base md:text-lg mb-12 text-stone-200 max-w-2xl mx-auto">
            {homepage.heroBody}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={homepage.heroPrimaryCtaLink} className="btn-primary">
              {homepage.heroPrimaryCtaLabel}
            </Link>
            <Link href={homepage.heroSecondaryCtaLink} className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              {homepage.heroSecondaryCtaLabel}
            </Link>
          </div>
        </div>

        <div className="craft-divider mt-12"></div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
