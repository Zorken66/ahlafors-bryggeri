import Link from "next/link";

import type { SiteContent } from "@/lib/content-schema";

export default function AnniversarySection({ homepage }: { homepage: SiteContent["homepage"] }) {
  return (
    <section className="section-padding overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-amber-300">{homepage.anniversaryEyebrow}</p>
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
              {homepage.anniversaryBadge}
            </div>

            <h2 className="heading-lg mb-5 text-white">{homepage.anniversaryTitle}</h2>
            <p className="max-w-2xl text-xl leading-relaxed text-stone-200">{homepage.anniversaryLead}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">{homepage.anniversaryBody}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {homepage.anniversaryHighlights.slice(0, 3).map((highlight, index) => (
                <div key={`${highlight}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">0{index + 1}</div>
                  <p className="text-sm font-medium leading-6 text-stone-100">{highlight}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href={homepage.anniversaryPrimaryCtaLink} className="btn-primary">
                {homepage.anniversaryPrimaryCtaLabel}
              </Link>
              <Link href={homepage.anniversarySecondaryCtaLink} className="btn-secondary border-white bg-transparent text-white hover:bg-white hover:text-stone-900">
                {homepage.anniversarySecondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${homepage.anniversaryImage}')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            <div className="absolute right-6 top-6 flex h-28 w-28 items-center justify-center rounded-full border border-amber-300/50 bg-stone-950/75 text-center shadow-xl backdrop-blur-sm">
              <div>
                <div className="text-3xl font-bold text-amber-300">30</div>
                <div className="text-xs uppercase tracking-[0.3em] text-stone-200">år</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Ahlafors Bryggerier</p>
              <p className="max-w-md text-2xl font-semibold leading-tight text-white">Ett jubileumsår att fira på plats, i glaset och i berättelsen om bryggeriet.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
