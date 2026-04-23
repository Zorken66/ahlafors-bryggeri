import type { SiteContent } from "@/lib/content-schema";
import { isPublishedNow, type PublishableFields } from "@/lib/publishing";

function isPublished(item: PublishableFields) {
  return isPublishedNow(item);
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
