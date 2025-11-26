import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-stone-900 text-white overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
      
      {/* Background image placeholder - ersätt med riktig bild */}
      <div className="absolute inset-0 bg-cover bg-center" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072')",
             backgroundPosition: "center"
           }}>
      </div>

      {/* Content */}
      <div className="relative z-20 container-custom text-center">
        <div className="craft-divider mb-8"></div>
        
        <h1 className="heading-xl mb-6 text-white">
          Hantverk i varje droppe
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-stone-200 max-w-3xl mx-auto font-light">
          Upptäck det unika hantverket bakom varje flaska från Ahlafors Bryggeri
        </p>
        
        <p className="text-lg md:text-xl mb-12 text-amber-400 font-serif italic">
          Sedan 1854
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/produkter" className="btn-primary">
            Upptäck vårt sortiment
          </Link>
          <Link href="/rulleriet" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
            Besök Rulleriet
          </Link>
        </div>

        <div className="craft-divider mt-12"></div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
