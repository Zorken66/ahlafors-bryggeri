import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import RichTextContent from "@/components/RichTextContent";
import { getCmsSession } from "@/lib/cms-auth";
import { readSiteContent } from "@/lib/content-store";
import { formatDateOnly } from "@/lib/date-utils";
import { richTextToPlainText } from "@/lib/rich-text";
import { getRullerietPostBySlug } from "@/lib/rulleriet-posts";

type RullerietPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{ preview?: string }>;
};

export default async function RullerietPostPage({ params, searchParams }: RullerietPostPageProps) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const session = preview ? await getCmsSession() : null;
  const { rulleriet } = await readSiteContent();
  const post = getRullerietPostBySlug(rulleriet, slug, { preview, hasSession: Boolean(session) });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative h-[50vh] flex items-end bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${post.image}')` }}></div>
        <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/70 to-stone-900/30"></div>
        <div className="relative z-10 container-custom pb-12">
          <Link href="/rulleriet" className="mb-6 inline-block text-sm font-semibold uppercase tracking-wider text-amber-300 hover:text-white">
            Tillbaka till Rulleriet
          </Link>
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-300">
            {formatDateOnly(post.publishedAt, "sv-SE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{post.title}</h1>
          <RichTextContent value={post.excerpt} className="mt-4 max-w-3xl text-lg text-stone-200" />
          {preview && session && (
            <div className="mt-6 inline-flex rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-950">
              Förhandsvisning av utkast
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-white">
        <article className="container-custom max-w-4xl">
          <RichTextContent value={post.content} className="text-lg leading-8 text-stone-700" />
        </article>
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: RullerietPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { rulleriet, site } = await readSiteContent();
  const post = getRullerietPostBySlug(rulleriet, slug);

  if (!post) {
    return {
      title: `${site.companyName} - Rulleriet`,
      description: site.metadataDescription,
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || richTextToPlainText(post.excerpt),
  };
}
