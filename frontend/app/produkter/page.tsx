import Link from "next/link";

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
    category: "ale"
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
    category: "ale"
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
    category: "ipa"
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
    category: "lager"
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
    category: "lager"
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
    category: "ale"
  }
];

export default function ProdukterPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Våra produkter</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            Helmaltsöl bryggt med kärlek efter gamla traditioner
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-xl text-stone-700 leading-relaxed mb-4">
            Våra ölsorter är alla <strong>helmaltsöl</strong> och vi använder alltid <strong>färsk humle</strong>.
          </p>
          <p className="text-lg text-stone-600">
            Hantverksmässiga grunder (de tyska renhetslagarna) och småskaliga metoder är en del av hemligheten bakom våra goda drycker.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url('${product.image}')` }}
                  ></div>
                  <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-sm font-bold">
                    {product.alcohol}
                  </div>
                  <div className="absolute top-4 left-4 bg-stone-900/80 text-white px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                    {product.type}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                    {product.style}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 text-stone-900">
                    {product.name}
                  </h3>
                  <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="text-sm text-stone-500">
                      <strong>Volym:</strong> {product.volume}
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
                    className="inline-block mt-4 text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors border-b-2 border-amber-700 hover:border-amber-900"
                  >
                    Hitta på Systembolaget →
                  </a>
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
