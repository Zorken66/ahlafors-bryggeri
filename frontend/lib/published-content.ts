import type { SiteContent } from "@/lib/content-schema";
import { isPublishedNow, type PublishableFields } from "@/lib/publishing";

function isPublished(item: PublishableFields) {
  return isPublishedNow(item);
}

function getVisibleItems<T extends PublishableFields>(
  items: T[],
  options?: { preview?: boolean; hasSession?: boolean },
) {
  if (options?.preview && options.hasSession) {
    return items;
  }

  return items.filter(isPublished);
}

export function getPublishedProducts(products: SiteContent["products"]) {
  return products.filter(isPublished);
}

export function getVisibleProducts(
  products: SiteContent["products"],
  options?: { preview?: boolean; hasSession?: boolean },
) {
  return getVisibleItems(products, options);
}

export function getPublishedNews(news: SiteContent["news"]) {
  return news.filter(isPublished);
}

export function getVisibleNews(
  news: SiteContent["news"],
  options?: { preview?: boolean; hasSession?: boolean },
) {
  return getVisibleItems(news, options);
}

export function getPublishedServices(services: SiteContent["services"]) {
  return services.filter(isPublished);
}

export function getVisibleServices(
  services: SiteContent["services"],
  options?: { preview?: boolean; hasSession?: boolean },
) {
  return getVisibleItems(services, options);
}

export function getPublishedRecipes(recipes: SiteContent["recipes"]) {
  return recipes.filter(isPublished);
}

export function getVisibleRecipes(
  recipes: SiteContent["recipes"],
  options?: { preview?: boolean; hasSession?: boolean },
) {
  return getVisibleItems(recipes, options);
}
