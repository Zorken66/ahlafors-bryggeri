import Link from "next/link";

import RichTextContent from "@/components/RichTextContent";
import type { SiteContent } from "@/lib/content-schema";
import { formatDateOnly } from "@/lib/date-utils";

export default function NewsSection({
  news,
  title,
  intro,
  ctaLabel,
  preview = false,
  highlightedId,
}: {
  news: SiteContent["news"];
  title: string;
  intro: string;
  ctaLabel: string;
  preview?: boolean;
  highlightedId?: string;
}) {
  return (
    <section id="nyheter" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">{title}</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            {intro}
          </p>
          <div className="craft-divider"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.slice(0, 3).map((item) => (
            <article
              key={item.id}
              id={`news-${item.id}`}
              className={`group bg-stone-50 shadow-md transition-all duration-300 hover:shadow-xl ${
                preview && highlightedId === item.id ? "ring-2 ring-amber-400 ring-offset-4 ring-offset-white" : ""
              }`}
            >
              <div className="relative h-56 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${item.image}')` }}
                ></div>
              </div>

              <div className="p-6">
                <time className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                  {formatDateOnly(item.date, 'sv-SE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                
                <h3 className="text-xl font-serif font-bold mt-2 mb-3 text-stone-900 group-hover:text-copper transition-colors">
                  {item.title}
                </h3>
                
                <RichTextContent value={item.excerpt} className="mb-4 text-sm leading-relaxed text-stone-600" />
                {preview && item.published === false && (
                  <div className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
                    Förhandsvisning av utkast
                  </div>
                )}
                
                <Link 
                  href={item.link}
                  className="inline-block text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  Läs mer →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/rulleriet" className="btn-secondary">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
