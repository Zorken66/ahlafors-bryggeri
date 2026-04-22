import Link from "next/link";
import type { Metadata } from "next";

import ContactForm from "@/components/ContactForm";
import { readSiteContent } from "@/lib/content-store";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";

export default async function KontaktPage() {
  const { contact } = await readSiteContent();
  const mapQuery = encodeURIComponent(contact.addressLines.join(", "));
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[50vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(contact.heroOverlayOpacity)}></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${contact.heroImage}')`
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{contact.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            {contact.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-md mb-8">Besök oss</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">{contact.addressTitle}</h3>
                  <p className="text-stone-700 leading-relaxed">
                    {contact.addressLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">{contact.locationTitle}</h3>
                  <p className="text-stone-700 leading-relaxed">
                    {contact.locationDescription}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold mb-3 text-stone-900">Sociala medier</h3>
                  <div className="flex gap-4">
                    {contact.socialLinks.map((social) => (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-full border border-copper px-4 py-2 text-copper hover:text-amber-700 hover:border-amber-700 transition-colors"
                      >
                        {social.platform}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border-l-4 border-amber-600">
                  <h3 className="text-lg font-bold mb-2 text-stone-900">{contact.productsInfoTitle}</h3>
                  {contact.productsInfoParagraphs.map((paragraph, index) => (
                    <p key={paragraph} className={`text-stone-700 text-sm leading-relaxed ${index > 0 ? "mt-2" : ""}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-stone-100 p-8">
              <h2 className="heading-md mb-6">Skicka meddelande</h2>
              <ContactForm subjectPlaceholder={contact.contactFormSubjectPlaceholder} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <h2 className="heading-md mb-8 text-center">{contact.mapTitle}</h2>
          <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-lg">
            <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-200">
              <iframe
                title={`Karta till ${contact.addressLines[0]}`}
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col gap-3 px-2 py-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <div>
                <p className="text-lg font-semibold text-stone-900">Karta över Alafors</p>
                <p className="mt-1 text-sm text-stone-600">{contact.mapSubtitle}</p>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                Öppna i Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="heading-md mb-6">{contact.ctaTitle}</h2>
          <p className="text-xl mb-8">{contact.ctaText}</p>
          <Link href="/rulleriet" className="btn-primary">
            Se öppettider
          </Link>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { contact, site } = await readSiteContent();
  return {
    title: contact.seoTitle || `${site.companyName} - Kontakt`,
    description: contact.seoDescription || site.metadataDescription,
  };
}
