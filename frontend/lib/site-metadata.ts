import type { Metadata } from "next";

export function getCanonicalBase() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
}

export function withAbsoluteUrl(value: string) {
  if (/^https?:\/\//.test(value)) {
    return value;
  }

  return new URL(value, getCanonicalBase()).toString();
}

export function buildOpenGraphMetadata({ title, description, url, image }: { title: string; description: string; url: string; image?: string }) {
  const absoluteUrl = withAbsoluteUrl(url);
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      type: "website" as const,
      images: image ? [{ url: withAbsoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: image ? [withAbsoluteUrl(image)] : undefined,
    },
  } satisfies Metadata;
}
