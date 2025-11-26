"use client";

import { useState } from "react";

const allProducts = [
  {
    id: 1,
    name: "Pale Ale",
    type: "Ale",
    description: "Välbalanserad och ljus öl med behaglig beska och rika smaker av bär, citrus och stenfrukter. Skapad med Pale Ale- och karamellmalt.",
    fullDescription: "Upptäck en välbalanserad och ljus öl som förför dina sinnen med sin behagliga beska och rika smaker. Denna öl kombinerar subtila inslag av bär, citrus och stenfrukter, vilket ger en komplex och tillfredsställande smakprofil. Den är skapad med en noggrant utvald blandning av Pale Ale- och karamellmalt, vilket bidrar till dess ljusa och fylliga karaktär. Den amerikanska, nyzeeländska humlen ger en frisk och aromatisk touch, som förhöjer hela smakupplevelsen.",
    style: "Pale Ale",
    alcohol: "3.5%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/sortiment/?q=ahlaffors",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070",
    category: "ale",
    featured: true
  },
  {
    id: 2,
    name: "Ahlafors Britt",
    type: "Ale",
    description: "Engelsk Bitter med fyllig maltighet, balanserad beska och noter av sirapslimpa, torkad frukt, choklad, knäck, pomerans och örter.",
    fullDescription: "Engelsk Bitter är en mångsidig och smakrik öl som erbjuder en balanserad kombination av maltighet och beska. Dess komplexa smaknyanser gör den till ett utmärkt val för den som uppskattar en dryck med djup och karaktär. Maltig smak med fyllig och rund maltighet som ger en robust bas. Tydlig och balanserad beska som framhäver ölets karaktär. Serveras vid 10-12°C och passar utmärkt till lamm- eller nötkött.",
    style: "English Bitter",
    alcohol: "5.4%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/produkt/ol/ahlafors-bryggerier-3210203/",
    artikelnummer: "32102",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=2070",
    category: "ale",
    featured: true
  },
  {
    id: 3,
    name: "Jubileumsipa",
    type: "IPA",
    description: "Kraftfull och aggressivt humlad IPA med Mosaic, Simcoe och Nelson Sauvin. Tropiska frukter, citrus och vinös karaktär.",
    fullDescription: "För att markera ett speciellt tillfälle presenterar vi stolt Ahlafors Jubileums IPA, en exklusiv crossover som kombinerar det bästa av våra traditionella ölsorter med en modern, innovativ twist. Inspirerad av trenderna från den amerikanska västkusten, är denna IPA kraftfull och aggressivt humlad. Humlad med tre amerikanska humlesorter: Mosaic, Simcoe och Nelson Sauvin, vilket ger komplex aromprofil med tropiska frukter, citrus, och vinös karaktär. Innehåller kornmalt av hög kvalitet för fyllig kropp och rundad maltighet.",
    style: "IPA",
    alcohol: "6.0%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/produkt/ol/ahlafors-jubileums-ipa-3115603/",
    artikelnummer: "31156-03",
    image: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?q=80&w=2070",
    category: "ipa",
    featured: true
  },
  {
    id: 4,
    name: "Ahlafors Märzen",
    type: "Lager",
    description: "Rik och maltig lager med aromer av knäckebröd, torkade aprikoser, choklad, honung, örter och apelsin.",
    fullDescription: "Upptäck Ahlafors Märzen, en öl som utmärker sig med sin rika och maltiga doft. Denna unika dryck kombinerar en harmonisk blandning av aromer som knäckebröd, torkade aprikoser, choklad, honung, örter och en frisk touch av apelsin. Varje klunk erbjuder en balanserad smakupplevelse där de maltiga inslagen möter den subtila sötman från honung och aprikoser, medan de aromatiska örterna och apelsinen tillför en frisk och komplex karaktär. Perfekt för den kräsne ölälskaren som uppskattar kvalitetsdrycker med karaktär och elegans.",
    style: "Märzen",
    alcohol: "5.4%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/produkt/ol/ahlafors-3285303/",
    artikelnummer: "32853",
    image: "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?q=80&w=2070",
    category: "lager",
    featured: true
  },
  {
    id: 5,
    name: "Ahlafors Ljusa",
    type: "Lager",
    description: "Exklusiv underjäst helmaltsöl på pilsner- och karamellmalt med sydtysk Perle-humle. Varsamt filtrerad och opastöriserad.",
    fullDescription: "Upptäck Ahlafors Ljusa, en exklusiv underjäst helmaltsöl som förädlas med noggrant utvalda ingredienser. Denna öl bryggs på pilsner- och karamellmalt, vilket skapar en balanserad och rik smakprofil. Den eleganta humlingen, med tre givor av Sydtysk Perle, tillför subtil arom och lätt bitterhet. Varsamt filtrerad för att bevara naturlig karaktär och fräschör, samtidigt opastöriserad för att behålla alla naturliga smaker och aromer. Kombinerar traditionell bryggkonst med moderna smaker.",
    style: "Ljus Lager",
    alcohol: "5.0%",
    volume: "50/33 cl",
    systembolaget: "https://www.systembolaget.se/sortiment/?q=ahlaffors",
    artikelnummer: "81131-06",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070",
    category: "lager",
    featured: true
  },
  {
    id: 6,
    name: "Oberoende APA",
    type: "Ale",
    description: "American Pale Ale från Sveriges Oberoende Bryggerier. Balanserad beska med krusbär, grapefrukt, ananas, rosmarin och vitpeppar.",
    fullDescription: "Utforska det spännande samarbetet inom Sveriges Oberoende Bryggerier. Vår exklusiva APA (American Pale Ale) utmärker sig genom sin balanserade och humlearomatiska profil. Tydlig beska balanseras av frisk och fruktig humlearom. Fyllig och aromatisk smakprofil med inslag av krusbär (lätt syrlig ton), kryddighet från rosmarin och vitpeppar, samt fruktighet från grapefrukt och ananas för tropisk och frisk karaktär. Perfekt för sociala sammanhang, till mat eller som uppfriskande dryck.",
    style: "American Pale Ale",
    alcohol: "5.6%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/produkt/ol/oberoende-3023103/",
    artikelnummer: "30231",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=2070",
    category: "ale",
    featured: true
  },
  {
    id: 7,
    name: "Ahlafors El Dorado",
    type: "Lager",
    description: "Ljus lager i modern stil. Maltig smak med tydlig beska, inslag av sirapslimpa, torkad frukt, apelsinskal och kryddor.",
    fullDescription: "Ahlafors El Dorado är en ljus lager i modern stil som kombinerar maltiga smaker med en tydlig beska. Perfekt för den som vill ha något lite annorlunda från traditionella lager. Smaker inkluderar sirapslimpa, torkad frukt, apelsinskal och kryddor som skapar en spännande och balanserad upplevelse. Passar utmärkt som sällskapsdryck eller till mat.",
    style: "Lager",
    alcohol: "5.2%",
    volume: "33 cl",
    systembolaget: "https://www.systembolaget.se/produkt/ol/ahlafors-3241003/",
    artikelnummer: "32410",
    image: "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?q=80&w=2070",
    category: "lager",
    featured: false
  }
];

const categories = [
  { id: "alla", name: "Alla", icon: "🍺" },
  { id: "ale", name: "Ale", icon: "🍻" },
  { id: "ipa", name: "IPA", icon: "🌿" },
  { id: "lager", name: "Lager", icon: "✨" }
];

export default function ProdukterPage() {
  const [activeCategory, setActiveCategory] = useState("alla");

  const filteredProducts = activeCategory === "alla" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <div className="inline-block mb-6">
            <div className="text-6xl mb-4">🍺</div>
          </div>
          <h1 className="heading-xl mb-6">Våra Produkter</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light leading-relaxed">
            Helmaltsöl bryggt med <span className="text-amber-400 font-semibold">kärlek</span> efter gamla traditioner
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-stone-300">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>Färsk humle</span>
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-4"></span>
            <span>Hantverksmässiga metoder</span>
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-4"></span>
            <span>Tyska renhetslagarna</span>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-amber-500">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 py-6 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? "bg-amber-600 text-white shadow-lg scale-105"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:shadow-md"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-linear-to-b from-stone-50 to-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-amber-500"
              >
                {/* Product Image */}
                <div className="relative h-72 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url('${product.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {product.alcohol}
                  </div>
                  <div className="absolute top-4 left-4 bg-stone-900/90 text-white px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold shadow-lg">
                    {product.type}
                  </div>
                  
                  {product.featured && (
                    <div className="absolute bottom-4 left-4 bg-amber-500 text-stone-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      ⭐ Populär
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                    {product.style}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-stone-900 group-hover:text-copper transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-stone-600 mb-4 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-stone-200">
                    <div className="text-sm text-stone-700">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                        </svg>
                        <strong>{product.volume}</strong>
                      </div>
                      {product.artikelnummer && (
                        <div className="text-xs text-stone-400">
                          Art.nr: {product.artikelnummer}
                        </div>
                      )}
                    </div>
                    
                    <a 
                      href={product.systembolaget}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Köp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">Beställ till Systembolaget</h2>
          <p className="text-xl mb-8">
            Vår öl och cider kan beställas till vilket Systembolag som helst i landet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/rulleriet" className="btn-primary">
              Besök Rulleriet
            </a>
            <a href="/kontakt" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              Kontakta oss
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
