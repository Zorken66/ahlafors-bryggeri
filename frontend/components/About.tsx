export default function About() {
  return (
    <section className="section-padding bg-stone-50 texture-overlay">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="heading-lg mb-6 text-stone-900">
              Ett mikrobryggeri med <span className="text-copper">historia</span>
            </h2>
            
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <p className="text-lg">
                Välkommen till <strong className="text-stone-900">Ahlafors Bryggeri</strong> – ett mikrobryggeri som kombinerar 
                tradition och innovation i hjärtat av den historiska spinnerifabriken i Alafors, 
                endast tre mil norr om Göteborg.
              </p>
              
              <p>
                Vår passion för att skapa högkvalitativa öl och cider genomsyrar varje steg i 
                bryggprocessen, där precision och stolthet är ledorden.
              </p>
              
              <p>
                Sedan 1854 har Alafors varit synonymt med kvalitet och hantverk. Idag fortsätter 
                vi denna tradition genom att brygga öl som hedrar vår historia samtidigt som vi 
                omfamnar moderna bryggteknik.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-copper mb-2">170+</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">År av historia</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-copper mb-2">100%</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">Hantverk</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-copper mb-2">12+</div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">Unika sorter</div>
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
