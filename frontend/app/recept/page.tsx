import Link from "next/link";
import type { Metadata } from "next";

import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";
import { getPublishedRecipes } from "@/lib/published-content";

export default async function ReceptPage() {
  const { recipes, recipesPage, site } = await readSiteContent();
  const publishedRecipes = getPublishedRecipes(recipes);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(recipesPage.heroOverlayOpacity)}></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${recipesPage.heroImage}')`
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{recipesPage.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            {recipesPage.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-xl text-stone-700 leading-relaxed mb-4">
            {recipesPage.introTitle}
          </p>
          <p className="text-lg text-stone-600">
            {recipesPage.introSubtext}
          </p>
        </div>
      </section>

      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Recipe Image */}
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url('${recipe.image}')` }}
                  ></div>
                  <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-xs font-bold uppercase">
                    {recipe.difficulty}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/90 to-transparent p-4">
                    <h3 className="text-xl font-serif font-bold text-white">
                      {recipe.title}
                    </h3>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-6">
                  <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                    {recipe.description}
                  </p>
                  
                  <div className="space-y-2 mb-4 text-sm text-stone-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-copper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-4">
                    <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                      Passa med:
                    </div>
                    <div className="text-sm font-semibold text-stone-900">
                      {recipe.pairing}
                    </div>
                  </div>

                  {/* Expandable recipe details */}
                  <details className="mt-4 group/details">
                    <summary className="cursor-pointer text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors list-none flex items-center gap-2">
                      <span>Visa recept</span>
                      <svg className="w-4 h-4 group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-bold text-stone-900 mb-2">Ingredienser:</h4>
                        <ul className="space-y-1 text-sm text-stone-700">
                          {recipe.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-copper mt-1">•</span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-stone-900 mb-2">Instruktioner:</h4>
                        <ol className="space-y-2 text-sm text-stone-700">
                          {recipe.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold text-copper min-w-[20px]">{idx + 1}.</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">{recipesPage.ctaTitle}</h2>
          <p className="text-xl mb-8">{recipesPage.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={recipesPage.ctaPrimaryLink} className="btn-primary">
              {recipesPage.ctaPrimaryLabel}
            </Link>
            <Link href={recipesPage.ctaSecondaryLink} className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              {recipesPage.ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { recipesPage, site } = await readSiteContent();
  return {
    title: recipesPage.seoTitle || `${site.companyName} - Recept`,
    description: recipesPage.seoDescription || site.metadataDescription,
  };
}
