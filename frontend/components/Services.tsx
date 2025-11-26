import Link from "next/link";

const services = [
  {
    id: 1,
    title: "Profileringsöl",
    description: "Skapa unika ölsorter för ditt företag eller förening. Vi hjälper dig från koncept till färdig produkt.",
    icon: "🏢",
    link: "/tjanster/profilol"
  },
  {
    id: 2,
    title: "Bar & Restaurangöl",
    description: "Öl i fat eller flaska för din restaurang eller bar. Högkvalitativa hantverksöl som imponerar på dina gäster.",
    icon: "🍺",
    link: "/tjanster/bar-restaurang"
  },
  {
    id: 3,
    title: "Ge-bort-present",
    description: "Perfekta presenter för ölälskare. Presentkort, merchandise och exklusiva ölpaket.",
    icon: "🎁",
    link: "/tjanster/presenter"
  }
];

export default function Services() {
  return (
    <section className="section-padding bg-oak text-white texture-overlay">
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">Våra tjänster</h2>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Vi erbjuder mer än bara öl – vi skapar upplevelser
          </p>
          <div className="craft-divider"></div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-stone-800/50 backdrop-blur-sm p-8 border-2 border-amber-600/30 hover:border-amber-600 transition-all duration-300 group"
            >
              <div className="text-6xl mb-4">{service.icon}</div>
              
              <h3 className="text-2xl font-serif font-bold mb-4 text-amber-400 group-hover:text-amber-300 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-stone-300 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <Link 
                href={service.link}
                className="inline-block text-amber-400 hover:text-white font-semibold text-sm uppercase tracking-wider transition-colors border-b-2 border-amber-400 hover:border-white"
              >
                Läs mer →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
