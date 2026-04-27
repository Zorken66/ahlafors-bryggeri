import type { Metadata } from "next";
import Link from "next/link";

import RichTextContent from "@/components/RichTextContent";
import { getCmsSession } from "@/lib/cms-auth";
import { readSiteContent } from "@/lib/content-store";
import type { RullerietEvent } from "@/lib/content-schema";
import { formatDateOnly, getDateOnlyDay, isDateTimeInPast } from "@/lib/date-utils";
import { buildHeroOverlayStyle } from "@/lib/hero-overlay";
import { richTextToPlainText } from "@/lib/rich-text";
import { getVisibleRullerietPosts } from "@/lib/rulleriet-posts";

function getVisibleEvents(events: RullerietEvent[], options?: { preview?: boolean; hasSession?: boolean }) {
  return [...events]
    .filter((event) => options?.preview && options.hasSession ? true : event.published !== false)
    .sort((a, b) => {
      if ((a.featured ?? false) !== (b.featured ?? false)) {
        return a.featured ? -1 : 1;
      }

      return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    });
}

type RullerietsPageProps = {
  searchParams?: Promise<{ preview?: string; postId?: string; eventId?: string }>;
};

export default async function RullerietsPage({ searchParams }: RullerietsPageProps) {
  const resolvedSearchParams = await searchParams;
  const preview = resolvedSearchParams?.preview === "1";
  const selectedPostId = resolvedSearchParams?.postId;
  const selectedEventId = resolvedSearchParams?.eventId;
  const session = preview ? await getCmsSession() : null;
  const { rulleriet, contact } = await readSiteContent();
  const posts = getVisibleRullerietPosts(rulleriet, { preview, hasSession: Boolean(session) });
  const events = getVisibleEvents(rulleriet.events, { preview, hasSession: Boolean(session) });

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[60vh] flex items-center justify-center bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-10" style={buildHeroOverlayStyle(rulleriet.heroOverlayOpacity)}></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${rulleriet.heroImage}')`,
            backgroundPosition: "center 28%",
          }}
        ></div>
        
        <div className="relative z-20 container-custom text-center">
          <h1 className="heading-xl mb-6">{rulleriet.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto font-light">
            {rulleriet.heroSubtitle}
          </p>
          {preview && session && (
            <div className="mt-6 inline-flex rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-950">
              Förhandsvisning av Rulleriet
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="heading-md mb-8 text-center">{rulleriet.introTitle}</h2>
          
          <div className="prose prose-lg max-w-none text-stone-700 leading-relaxed space-y-4">
            {rulleriet.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-8">
              <p className="text-amber-900 font-semibold mb-2">{rulleriet.paymentTitle}</p>
              <p className="text-amber-800">{rulleriet.paymentText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-stone-100">
        <div className="container-custom">
          <h2 className="heading-md mb-12 text-center">Kommande evenemang</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const eventDay = getDateOnlyDay(event.date);
              const eventMonthLabel = formatDateOnly(event.date, "sv-SE", { month: "long", year: "numeric" });
              const isPast = isDateTimeInPast(event.date, event.time);
              
              return (
                <div 
                  key={event.id} 
                  id={`rulleriet-event-${event.id}`}
                  className={`overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${isPast ? 'opacity-60' : ''} ${
                    preview && selectedEventId === event.id ? "ring-2 ring-amber-400 ring-offset-4 ring-offset-stone-100" : ""
                  }`}
                >
                  {event.image && (
                    <div
                      className="h-52 bg-cover bg-center"
                      style={{ backgroundImage: `url('${event.image}')` }}
                    ></div>
                  )}
                  <div className="bg-amber-600 text-white p-4 text-center">
                    <div className="text-3xl font-bold">
                      {eventDay ?? "?"}
                    </div>
                    <div className="text-sm uppercase tracking-wider">
                      {eventMonthLabel}
                    </div>
                    <div className="text-sm mt-1 font-semibold">
                      {event.time}{event.endTime ? `-${event.endTime}` : ""}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        {event.title}
                      </h3>
                      {event.featured && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Utvalt
                        </span>
                      )}
                    </div>
                    {event.location && (
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {event.location}
                      </p>
                    )}
                    <RichTextContent value={event.description} className="mb-4 text-sm leading-relaxed text-stone-600" />
                    {event.food && (
                      <div className="flex items-start gap-2 text-sm text-amber-700">
                        <span className="text-lg">🍴</span>
                        <span className="font-semibold">{event.food}</span>
                      </div>
                    )}
                    {event.ticketUrl && (
                      <Link
                        href={event.ticketUrl}
                        className="mt-5 inline-flex rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-700"
                      >
                        Läs mer / boka
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <p className="text-center text-stone-500">Det finns inga publicerade evenemang just nu.</p>
          )}
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="heading-md mb-4">{rulleriet.blogTitle}</h2>
            <p className="text-lg text-stone-600">{rulleriet.blogIntro}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                id={`rulleriet-post-${post.id}`}
                className={`overflow-hidden bg-stone-50 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
                  preview && selectedPostId === post.id ? "ring-2 ring-amber-400 ring-offset-4 ring-offset-white" : ""
                }`}
              >
                <Link href={`/rulleriet/${post.slug}${preview && session ? "?preview=1" : ""}`} className="block">
                  <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url('${post.image}')` }}></div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <time className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                        {formatDateOnly(post.publishedAt, "sv-SE", { year: "numeric", month: "long", day: "numeric" })}
                      </time>
                      {post.featured && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Utvald
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900">{post.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{richTextToPlainText(post.excerpt)}</p>
                    <span className="mt-5 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                      Läs inlägg
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="text-center text-stone-500">Det finns inga publicerade inlägg ännu.</p>
          )}
        </div>
      </section>

      <section className="section-padding bg-oak text-white">
        <div className="container-custom text-center max-w-2xl">
          <h2 className="heading-md mb-6">{rulleriet.locationTitle}</h2>
          <p className="text-xl mb-8">{rulleriet.locationText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contact.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={link.platform === "Facebook" ? "btn-primary" : "btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-stone-900"}
              >
                {link.platform === "Facebook" ? "Följ oss på Facebook" : link.platform}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { rulleriet, site } = await readSiteContent();
  return {
    title: rulleriet.seoTitle || `${site.companyName} - Rulleriet`,
    description: rulleriet.seoDescription || site.metadataDescription,
  };
}
