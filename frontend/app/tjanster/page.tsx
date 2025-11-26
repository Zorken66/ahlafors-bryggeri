export default function TjansterPage() {
  const services = [
    {
      title: "Profileringsöl för företag",
      description: "Skapa unika ölsorter för ditt företag eller förening",
      details: [
        "Anpassad receptur efter era önskemål",
        "Egen etikett med ert företags profil",
        "Perfekt för företagsevent och gåvor",
        "Minsta beställning enligt överenskommelse"
      ],
      icon: "🏢"
    },
    {
      title: "Bar & Restaurangöl",
      description: "Öl i fat eller flaska för restauranger och pubar",
      details: [
        "30 liters eller 15 liters fat",
        "Fasta leveranser eller engångsbeslä",
        "Högkvalitativa hantverksöl",
        "Säljs på pubar och restauranger i Göteborg och Kungälv"
      ],
      icon: "🍺"
    },
    {
      title: "Festutrustning",
      description: "Bordspumpar och bardisk för uthyrning",
      details: [
        "Bordspump med kylanläggning",
        "Komplett bardisk för större event",
        "För privata fester och evenemang",
        "Köp öl i 30 eller 15 liters fat"
      ],
      icon: "🎉"
    },
    {
      title: "Presentkort & Merchandise",
      description: "Ge bort upplevelser och produkter",
      details: [
        "Presentkort på öl och besök på Rulleriet",
        "Ölpaket med våra bästa sorter",
        "Ahlafors-merchandise",
        "Perfekt som företagsgåva"
      ],
      icon: "🎁"
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
            backgroundImage: "url('https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=2070')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Våra tjänster</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            Vi hjälper gärna till med allt som ett bryggeri kan erbjuda
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-xl text-stone-700 leading-relaxed">
            Vi som ett <strong>mindre bryggeri</strong> har möjligheten att se till våra kunders behov. 
            Ni som restaurangägare, festfixare eller ölintresserad skall känna er välkommen hos oss.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">Intresserad?</h2>
          <p className="text-xl mb-8">
            Kontakta oss för mer information om våra tjänster och hur vi kan hjälpa er.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/kontakt" className="btn-primary">
              Kontakta oss
            </a>
            <a href="/produkter" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              Se våra produkter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
