import Link from "next/link";

const news = [
  {
    id: 1,
    title: "Rulleriets öppettider",
    excerpt: "Nästa tillfälle – Fredag 14/11 kl 17-22. Lite nyheter på kranarna. Kanske Julölen?",
    date: "2024-11-14",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=2074"
  },
  {
    id: 2,
    title: "Är det AW – Besök rulleriet",
    excerpt: "Välkomna till Rulleriet! När vi kör AW så har vi olika Foodtrucken utanför som serverar härliga tillbehör!",
    date: "2024-11-08",
    image: "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=2073"
  },
  {
    id: 3,
    title: "Ahlafors - Sedan 1854",
    excerpt: "Läs mer om vår historia och hur allt började i den historiska spinnerifabriken.",
    date: "2024-10-15",
    image: "https://images.unsplash.com/photo-1594818020155-ca8dd1a7d13a?q=80&w=2070"
  }
];

export default function NewsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">Nyheter</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Håll dig uppdaterad med det senaste från bryggeriet
          </p>
          <div className="craft-divider"></div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item) => (
            <article key={item.id} className="group bg-stone-50 shadow-md hover:shadow-xl transition-all duration-300">
              {/* News Image */}
              <div className="relative h-56 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${item.image}')` }}
                ></div>
              </div>

              {/* News Content */}
              <div className="p-6">
                <time className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                  {new Date(item.date).toLocaleDateString('sv-SE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                
                <h3 className="text-xl font-serif font-bold mt-2 mb-3 text-stone-900 group-hover:text-copper transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                  {item.excerpt}
                </p>
                
                <Link 
                  href={`/nyheter/${item.id}`}
                  className="inline-block text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  Läs mer →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/nyheter" className="btn-secondary">
            Alla nyheter
          </Link>
        </div>
      </div>
    </section>
  );
}
