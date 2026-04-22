import type { SiteContent } from "@/lib/content-schema";

type Publishable = {
  published?: boolean;
  publishedAt?: string;
};

function isPublished(item: Publishable) {
  if (item.published === false) {
    return false;
  }

  if (!item.publishedAt) {
    return true;
  }

  return new Date(item.publishedAt).getTime() <= Date.now();
}

export function getPublishedProducts(products: SiteContent["products"]) {
  return products.filter(isPublished);
}

export function getPublishedNews(news: SiteContent["news"]) {
  return news.filter(isPublished);
}

export function getPublishedServices(services: SiteContent["services"]) {
  return services.filter(isPublished);
}

export function getPublishedRecipes(recipes: SiteContent["recipes"]) {
  return recipes.filter(isPublished);
}
