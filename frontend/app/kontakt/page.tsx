export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=2070')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Kontakta oss</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            Välkommen att höra av dig – vi finns i hjärtat av Alafors
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="heading-md mb-8">Besök oss</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Adress</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Ahlafors Bryggerier AB<br />
                    Spinnerigatan (gamla spinneriet från 1850-talet)<br />
                    449 41 Alafors<br />
                    Ale kommun
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Plats</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Bryggeriet är beläget i det gamla spinneriet från 1850-talet, cirka 2,5 mil norr om Göteborg.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Sociala medier</h3>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.facebook.com/AhlaforsBryggerier/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-copper hover:text-amber-700 transition-colors"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.instagram.com/ahlaforsbryggerier/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-copper hover:text-amber-700 transition-colors"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border-l-4 border-amber-600">
                  <h3 className="text-lg font-bold mb-2 text-stone-900">Hitta våra produkter</h3>
                  <p className="text-stone-700 text-sm leading-relaxed mb-2">
                    Våra produkter finns på lager på Systembolagen i Nödinge, Kungälv och Bäckebol, men kan beställas över hela landet.
                  </p>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    Våra alkoholsvagare produkter säljs även i livsmedelsbutiker i Ale, Kungälv och Stenungsund.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-stone-100 p-8">
              <h2 className="heading-md mb-6">Skicka meddelande</h2>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
                    Namn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
                    E-post *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-stone-700 mb-2">
                    Ämne *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-stone-700 mb-2">
                    Meddelande *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-copper focus:ring-2 focus:ring-copper/20 transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Skicka meddelande
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <h2 className="heading-md mb-8 text-center">Hitta hit</h2>
          <div className="bg-white shadow-lg p-4">
            <div className="aspect-video bg-stone-200 flex items-center justify-center text-stone-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-lg">Karta över Alafors</p>
                <p className="text-sm mt-2">Cirka 2,5 mil norr om Göteborg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">Besök Rulleriet</h2>
          <p className="text-xl mb-8">
            Välkommen till vår smakbar där du kan provsmaka våra ölsorter och uppleva bryggeriets atmosfär.
          </p>
          <a href="/rulleriet" className="btn-primary">
            Se öppettider
          </a>
        </div>
      </section>
    </div>
  );
}
