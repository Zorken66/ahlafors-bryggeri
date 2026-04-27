import type { RullerietPost, SiteContent } from "@/lib/content-schema";

export function getPublishedRullerietPosts(rulleriet: SiteContent["rulleriet"]): RullerietPost[] {
  return [...rulleriet.blogPosts]
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getVisibleRullerietPosts(
  rulleriet: SiteContent["rulleriet"],
  options?: { preview?: boolean; hasSession?: boolean },
): RullerietPost[] {
  if (!(options?.preview && options.hasSession)) {
    return getPublishedRullerietPosts(rulleriet);
  }

  return [...rulleriet.blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getRullerietPostBySlug(
  rulleriet: SiteContent["rulleriet"],
  slug: string,
  options?: { preview?: boolean; hasSession?: boolean },
): RullerietPost | undefined {
  return getVisibleRullerietPosts(rulleriet, options).find((post) => post.slug === slug);
}
