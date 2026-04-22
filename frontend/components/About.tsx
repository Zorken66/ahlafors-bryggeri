import type { SiteContent } from "@/lib/content-schema";

export default function About({ about }: { about: SiteContent["about"] }) {
  const headingParts = about.homepageHeading.split(" ");
  const highlightedWord = headingParts.pop() ?? "";
  const headingPrefix = headingParts.join(" ");

  return (
    <section className="section-padding bg-stone-50 texture-overlay">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-lg mb-6 text-stone-900">
              {headingPrefix} <span className="text-copper">{highlightedWord}</span>
            </h2>
            
            <div className="space-y-4 text-stone-700 leading-relaxed">
              {about.homepageParagraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={index === 0 ? "text-lg" : index === about.homepageParagraphs.length - 1 ? "italic text-amber-800 font-semibold" : undefined}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              {about.stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-copper mb-2">{stat.value}</div>
                  <div className="text-sm text-stone-600 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-96 md:h-full min-h-[400px] rounded-none overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center"
                 style={{
                   backgroundImage: `url('${about.homepageImage}')`
                 }}>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
