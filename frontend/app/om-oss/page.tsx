export default function OmOssPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1594818020155-ca8dd1a7d13a?q=80&w=2070')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Om Ahlafors Bryggeri</h1>
          <p className="text-xl md:text-2xl text-amber-400 font-serif italic">
            Ett av Sveriges äldsta mikrobryggerier
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Text */}
            <div>
              <h2 className="heading-md mb-6">Historien</h2>
              <div className="space-y-4 text-stone-700 leading-relaxed">
                <p className="text-lg">
                  Ahlafors Bryggeri startade år <strong className="text-amber-700">1996</strong> av ett gäng 
                  bastubadande ölälskande herrar i Alafors – ett litet samhälle ca 2,5 mil norr 
                  Göteborg i Ale kommun.
                </p>
                
                <p>
                  Bryggeriet är beläget i det gamla <strong className="text-amber-700">spinneriet från 1850-talet</strong>. 
                  Vi brygger vårt öl med mycket kärlek och ideellt arbete efter gamla traditioner 
                  av kornmalt, hela humlekottar, vatten och jäst.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="relative h-96 rounded-none overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1532634733-cae1395e440f?q=80&w=2072')"
                }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-6 bg-stone-100">
              <div className="text-5xl font-bold text-amber-700 mb-2">1996</div>
              <div className="text-sm text-stone-600 uppercase tracking-wider">Grundat</div>
            </div>
            <div className="text-center p-6 bg-stone-100">
              <div className="text-5xl font-bold text-amber-700 mb-2">1850</div>
              <div className="text-sm text-stone-600 uppercase tracking-wider">Spinneriet</div>
            </div>
            <div className="text-center p-6 bg-stone-100">
              <div className="text-5xl font-bold text-amber-700 mb-2">100%</div>
              <div className="text-sm text-stone-600 uppercase tracking-wider">Hantverk</div>
            </div>
            <div className="text-center p-6 bg-stone-100">
              <div className="text-5xl font-bold text-amber-700 mb-2">Lokal</div>
              <div className="text-sm text-stone-600 uppercase tracking-wider">Produktion</div>
            </div>
          </div>

          {/* Craftsmanship */}
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-md mb-8 text-center">Vårt hantverk</h2>
            
            <div className="bg-amber-50 border-l-4 border-amber-600 p-8 mb-8">
              <p className="text-lg text-amber-900 italic">
                Våra ölsorter är alla <strong>helmaltsöl</strong> och vi använder alltid <strong>färsk humle</strong>. 
                Hantverksmässiga grunder (de tyska renhetslagarna) och småskaliga metoder är en del av 
                hemligheten bakom våra goda drycker.
              </p>
            </div>

            <div className="space-y-6 text-stone-700 leading-relaxed">
              <div>
                <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Ingredienser</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600">•</span>
                    <span><strong>Kornmalt</strong> – Högkvalitativ malt för bästa smak</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600">•</span>
                    <span><strong>Hela humlekottar</strong> – Alltid färsk humle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600">•</span>
                    <span><strong>Vatten</strong> – Rent och naturligt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600">•</span>
                    <span><strong>Jäst</strong> – Noggrant utvald</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Distribution</h3>
                <p>
                  Våra produkter tillhör det <strong>lokala sortimentet</strong> och finns på lager på 
                  Systembolagen i <strong>Nödinge, Kungälv och Bäckebol</strong>, men kan beställas över hela landet.
                </p>
                <p className="mt-4">
                  Vi säljs även på en del pubar och restauranger i Göteborg och Kungälv. Våra alkoholsvagare 
                  produkter finns i livsmedelsbutiker i Ale, Kungälv och Stenungsund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">Besök oss</h2>
          <p className="text-xl mb-4">
            Alafors, ca 2,5 mil norr om Göteborg i Ale kommun
          </p>
          <p className="text-lg text-stone-300 mb-8">
            I det historiska spinneriet från 1850-talet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/rulleriet" className="btn-primary">
              Besök Rulleriet
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
