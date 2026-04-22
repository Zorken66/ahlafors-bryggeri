import type { RullerietPost, SiteContent } from "@/lib/content-schema";

export function getPublishedRullerietPosts(rulleriet: SiteContent["rulleriet"]): RullerietPost[] {
  return [...rulleriet.blogPosts]
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getRullerietPostBySlug(rulleriet: SiteContent["rulleriet"], slug: string): RullerietPost | undefined {
  return getPublishedRullerietPosts(rulleriet).find((post) => post.slug === slug);
}
