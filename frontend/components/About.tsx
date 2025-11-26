export default function About() {
  return (
    <section className="section-padding bg-stone-50 texture-overlay">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="heading-lg mb-6 text-stone-900">
              Ett av Sveriges äldsta <span className="text-copper">mikrobryggerier</span>
            </h2>
            
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <p className="text-lg">
                Startade år <strong className="text-stone-900">1996</strong> av ett gäng bastubadande 
                ölälskande herrar i Alafors – ett litet samhälle ca 2,5 mil norr Göteborg i Ale kommun.
              </p>
              
              <p>
                Bryggeriet är beläget i det gamla <strong className="text-stone-900">spinneriet från 1850-talet</strong>. 
                Vi brygger vårt öl med mycket kärlek och ideellt arbete efter gamla traditioner av kornmalt, 
                hela humlekottar, vatten och jäst. Vi tillverkar även drycker av ciderkaraktär.
              </p>
              
              <p>
                Våra produkter tillhör det lokala sortimentet och finns på lager på Systembolagen i 
                Nödinge, Kungälv och Bäckebol, men kan beställas över hela landet. Det säljs även på 
                en del pubar och restauranger i Göteborg och Kungälv.
              </p>

              <p className="italic text-amber-800 font-semibold">
                Hantverksmässiga grunder (de tyska renhetslagarna) och småskaliga metoder är en del 
                av hemligheten bakom våra goda drycker.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-copper mb-2">1996</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">Grundat</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-copper mb-2">100%</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">Hantverk</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-copper mb-2">1850</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">Spinneriet</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-96 md:h-full min-h-[400px] rounded-none overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center"
                 style={{
                   backgroundImage: "url('https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?q=80&w=2070')"
                 }}>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
