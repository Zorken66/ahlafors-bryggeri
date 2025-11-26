export default function RullerietsPage() {
  const events = [
    {
      date: "2025-09-19",
      time: "17:00 - 22:00",
      title: "Quiz-kväll på Rulleriet",
      description: "Rulleriet öppnar kl 17. Det blir Quiz!",
      food: "La Chiva står för maten"
    },
    {
      date: "2025-10-03",
      time: "17:00 - 22:00",
      title: "After Work",
      description: "AW på Rulleriet? Naturligtvis!",
      food: "A taste of britain står för maten"
    },
    {
      date: "2025-10-17",
      time: "17:00 - 22:00",
      title: "Höstrus med Arepas",
      description: "Vi kör i höstrusket. Premiär för La Delicia foodtruck.",
      food: "Det blir Arepas"
    },
    {
      date: "2025-11-01",
      time: "16:00 - 21:00",
      title: "Lördagskväll med irakisk mat",
      description: "Vi bryter av med en lördag. Premiär för irakisk foodtruck.",
      food: "Irakiskt"
    },
    {
      date: "2025-11-14",
      time: "17:00 - 22:00",
      title: "Nyheter på kranarna",
      description: "Lite nyheter på kranarna. Kanske Julölen?",
      food: "The Mexican BBQ kommer tillbaka med Tacos"
    },
    {
      date: "2025-11-28",
      time: "17:00 - 22:00",
      title: "Säsongsavslutning",
      description: "Säsongsavslutning. Efter detta tar vi semester tills våren kommer.",
      food: "Våra irakiska vänner står för maten igen"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/70 to-stone-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=2073')"
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">Rulleriet</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            Ahlafors Taproom / Smakbar
          </p>
        </div>
      </section>

      {/* About Rulleriet */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="heading-md mb-8 text-center">Välkommen till Rulleriet</h2>
          
          <div className="prose prose-lg max-w-none text-stone-700 leading-relaxed space-y-4">
            <p>
              Vi erbjuder ständigt ett <strong>brett utbud av Ahlafors-sortimentet</strong>. Här serverar vi 
              inte bara våra klassiska ölsorter utan också unika, experimentella brygder och 
              smygpremiärer på kommande öl.
            </p>
            
            <p>
              Vi är alltid i rörelse och strävar efter att ge våra gäster en <strong>dynamisk och spännande 
              ölupplevelse</strong>. Dessutom finns ett noga utvalt urval av alkoholfria alternativ för den 
              som vill njuta av goda smaker utan alkohol.
            </p>
            
            <p>
              Vårt mål är att skapa en <strong>inbjudande atmosfär</strong> där ölintresserade kan utforska 
              nya smaker, delta i provningar och ta del av det senaste inom bryggkonst. Oavsett om 
              du är en erfaren ölfantast eller nyfiken nybörjare, är du varmt välkommen att upptäcka 
              vad Rulleriet har att erbjuda.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-8">
              <p className="text-amber-900 font-semibold mb-2">💳 Betalning</p>
              <p className="text-amber-800">Betalning sker med kort. Välkomna att rulla in!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Calendar */}
      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <h2 className="heading-md mb-12 text-center">Kommande evenemang</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => {
              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();
              
              return (
                <div 
                  key={index} 
                  className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${isPast ? 'opacity-60' : ''}`}
                >
                  <div className="bg-amber-600 text-white p-4 text-center">
                    <div className="text-3xl font-bold">
                      {eventDate.getDate()}
                    </div>
                    <div className="text-sm uppercase tracking-wider">
                      {eventDate.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm mt-1 font-semibold">
                      {event.time}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">
                      {event.title}
                    </h3>
                    <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                      {event.description}
                    </p>
                    {event.food && (
                      <div className="flex items-start gap-2 text-sm text-amber-700">
                        <span className="text-lg">🍴</span>
                        <span className="font-semibold">{event.food}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact/Location */}
      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-2xl">
          <h2 className="heading-md mb-6">Hitta hit</h2>
          <p className="text-xl mb-8">
            Rulleriet finns i det gamla spinneriet från 1850-talet i Alafors,<br/>
            ca 2,5 mil norr om Göteborg i Ale kommun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.facebook.com/AhlaforsBryggerier/" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Följ oss på Facebook
            </a>
            <a href="https://www.instagram.com/ahlaforsbryggerier/" target="_blank" rel="noopener noreferrer" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900">
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
