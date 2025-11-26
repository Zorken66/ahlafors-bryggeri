export default function ReceptPage() {
  const recipes = [
    {
      id: 1,
      title: "Ölmarinerad Entrecôte",
      description: "Saftig entrecôte marinerad i vår kraftfulla IPA med rosmarin och vitlök. Perfekt på grillen!",
      ingredients: [
        "4 entrecôte-stekar (ca 200g styck)",
        "3 dl Ahlafors Jubileumsipa",
        "3 vitlöksklyftor, pressade",
        "2 msk olivolja",
        "2 msk soja",
        "1 msk honung",
        "2 kvistar färsk rosmarin",
        "Salt och peppar"
      ],
      instructions: [
        "Blanda IPA, vitlök, olivolja, soja, honung och hackad rosmarin i en skål.",
        "Lägg entrecôte-stekarna i en form och häll över marinaden.",
        "Låt marinera i kylskåp i minst 4 timmar, gärna över natten.",
        "Ta upp köttet 30 minuter innan grillning för rumstemperatur.",
        "Grilla på hög värme ca 3-4 minuter per sida för medium.",
        "Låt vila i 5 minuter innan servering.",
        "Servera med grillade grönsaker och mer IPA!"
      ],
      difficulty: "Medel",
      time: "30 min + marinering",
      servings: "4 portioner",
      pairing: "Ahlafors Jubileumsipa",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069"
    },
    {
      id: 2,
      title: "Ölbröd med Ljusa",
      description: "Saftigt och smakfullt bröd med vår Ljusa lager. Perfekt som tillbehör till grillen eller till ost.",
      ingredients: [
        "5 dl Ahlafors Ljusa",
        "9 dl vetemjöl",
        "2 dl rågmjöl",
        "1 dl sirap",
        "2 tsk salt",
        "50g jäst",
        "2 msk rapsolja"
      ],
      instructions: [
        "Värm ölen till fingervarmt (37°C).",
        "Smula jästen i en bunke och lös upp den i lite av den varma ölen.",
        "Tillsätt resten av ölen, sirap, salt och olja.",
        "Blanda ihop vetemjölet och rågmjölet.",
        "Arbeta in mjölet lite i taget tills degen släpper från bunken.",
        "Låt jäsa under bakduk i ca 40 minuter.",
        "Knåda degen och forma till 2 limpor.",
        "Lägg i smorda formar och låt jäsa ytterligare 30 minuter.",
        "Grädda i 200°C i ca 40 minuter.",
        "Låt svalna på galler."
      ],
      difficulty: "Lätt",
      time: "2 timmar",
      servings: "2 limpor",
      pairing: "Ahlafors Ljusa",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072"
    },
    {
      id: 3,
      title: "Ölsoppa med Rotsaker",
      description: "Rustik och värmande rotsakssoppa med maltiga toner från vår Märzen lager.",
      ingredients: [
        "3 dl Ahlafors Märzen",
        "3 morötter",
        "1 palsternacka",
        "1/2 rotselleri",
        "2 schalottenlökar",
        "1 liter grönsaksbuljong",
        "2 dl vispgrädde",
        "2 msk smör",
        "Salt, peppar och timjan"
      ],
      instructions: [
        "Skala och tärna alla rotsaker i bitar.",
        "Fräs schalottenlöken i smör tills den är mjuk.",
        "Tillsätt rotsakerna och fräs i några minuter.",
        "Häll i ölen och låt koka ihop till hälften.",
        "Tillsätt buljongen och låt sjuda tills rotsakerna är mjuka (ca 20 min).",
        "Mixa soppan slät med stavmixer.",
        "Rör ner grädden och smaka av med salt, peppar och timjan.",
        "Servera med färskt bröd och ett glas Märzen!"
      ],
      difficulty: "Lätt",
      time: "45 minuter",
      servings: "4 portioner",
      pairing: "Ahlafors Märzen",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071"
    },
    {
      id: 4,
      title: "Beer Battered Fish & Chips",
      description: "Krispig friterad fisk i smet med vår Pale Ale. En klassiker som aldrig sviker!",
      ingredients: [
        "600g torskfilé",
        "2 dl Ahlafors Pale Ale",
        "2 dl vetemjöl",
        "1 tsk bakpulver",
        "Salt och peppar",
        "4 stora potatisar",
        "Olja till fritering",
        "Citronklyftor och tartarsås till servering"
      ],
      instructions: [
        "Skär potatisen i tjocka strips och blötlägg i kallt vatten i 30 min.",
        "Torka potatisen och fritera i 160°C i 5 minuter. Låt svalna.",
        "Blanda mjöl, bakpulver, salt och peppar. Rör ner ölen till en slät smet.",
        "Dela fisken i portionsbitar och krydda med salt och peppar.",
        "Doppa fisken i smeten och fritera i 180°C tills den är gyllene (ca 4-5 min).",
        "Fritera potatisen igen i 180°C tills den är krispig och gyllene.",
        "Servera med citron, tartarsås och självklart en kall Pale Ale!"
      ],
      difficulty: "Medel",
      time: "60 minuter",
      servings: "4 portioner",
      pairing: "Ahlafors Pale Ale",
      image: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=2070"
    },
    {
      id: 5,
      title: "Ölglaserad Fläskkarré",
      description: "Succulent fläskkarré glaserad med vår maltiga Britt och honungsenap.",
      ingredients: [
        "1 kg fläskkarré",
        "2 dl Ahlafors Britt",
        "3 msk honung",
        "2 msk dijonsenap",
        "2 vitlöksklyftor",
        "2 msk smör",
        "Salt, peppar och timjan"
      ],
      instructions: [
        "Sätt ugnen på 125°C.",
        "Krydda fläskkartén med salt, peppar och timjan.",
        "Bryn köttet i smör på alla sidor i en stekpanna.",
        "Lägg över i en ugnsform.",
        "Koka ihop öl, honung, senap och pressad vitlök till en tjock glasyr.",
        "Pensla köttet med glasyren.",
        "Stek i ugn tills innertemperaturen är 65°C (ca 45-60 min).",
        "Pensla med mer glasyr var 15:e minut.",
        "Låt vila i 10 minuter innan uppskärning.",
        "Servera med rotsaksmos och mer Britt!"
      ],
      difficulty: "Medel",
      time: "90 minuter",
      servings: "4-6 portioner",
      pairing: "Ahlafors Britt",
      image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=2085"
    },
    {
      id: 6,
      title: "Ölcheesecake med Karamell",
      description: "Krämig cheesecake med maltiga toner och salt karamellsås - en överraskning för smaklökarna!",
      ingredients: [
        "200g digestivekex",
        "100g smör",
        "600g philadelphiaost",
        "1 dl Ahlafors Märzen",
        "1 dl socker",
        "3 ägg",
        "1 dl vispgrädde",
        "2 tsk vaniljsocker",
        "Salt karamellsås till servering"
      ],
      instructions: [
        "Sätt ugnen på 175°C.",
        "Mosa kexen fint och blanda med smält smör. Tryck ut i botten på en springform (24 cm).",
        "Gräddbaka i 10 minuter. Låt svalna.",
        "Vispa philadelphiaost och socker pösigt.",
        "Tillsätt äggen ett i taget.",
        "Rör ner ölen, grädde och vaniljsocker.",
        "Häll smeten över kakbottnen.",
        "Gräddbaka i 50-60 minuter tills kakan är nästan fast men darrar lätt i mitten.",
        "Låt svalna i ugnen med dörren på glänt.",
        "Kyl i minst 4 timmar, gärna över natten.",
        "Servera med salt karamellsås och brygda nötter!"
      ],
      difficulty: "Medel",
      time: "90 min + kylning",
      servings: "8-10 portioner",
      pairing: "Ahlafors Märzen",
      image: "https://images.unsplash.com/photo-1533134242443-d4e2e2f79a3f?q=80&w=2070"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Recept</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            Spännande dryckesrecept och maträtter med våra öl
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-xl text-stone-700 leading-relaxed mb-4">
            Vi presenterar ett urval av <strong>spännande recept</strong> som du kan prova hemma.
          </p>
          <p className="text-lg text-stone-600">
            Utforska våra enkla steg-för-steg-instruktioner med våra öl som huvudingrediens eller som perfekt tillbehör.
          </p>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
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
          <h2 className="heading-md mb-6">Upptäck våra produkter</h2>
          <p className="text-xl mb-8">
            Alla våra öl och cider finns att beställa på Systembolaget över hela landet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/produkter" className="btn-primary">
              Se produkter
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
