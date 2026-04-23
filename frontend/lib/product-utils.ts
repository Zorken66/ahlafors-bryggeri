import type { ProductCategory, ProductEntry, ProductLink, SiteContent } from "@/lib/content-schema";

export type ProductWithComputedFields = ProductEntry & {
  slug: string;
  links: ProductLink[];
};

export function isAnniversaryProduct(product: Pick<ProductEntry, "id" | "name" | "slug">) {
  const slug = (product.slug || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const id = (product.id || "").toLowerCase();
  return slug.includes("jubile") || name.includes("jubile") || id.includes("jubile");
}

export function slugifyProduct(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeProductLinks(product: ProductEntry) {
  const explicitLinks = Array.isArray(product.links)
    ? product.links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.label && link.url)
    : [];

  if (explicitLinks.length > 0) {
    return explicitLinks;
  }

  if (product.systembolaget.trim()) {
    return [{ label: "Systembolaget", url: product.systembolaget.trim() }];
  }

  return [];
}

export function normalizeProduct(product: ProductEntry): ProductWithComputedFields {
  return {
    ...product,
    slug: product.slug?.trim() || slugifyProduct(product.name),
    links: normalizeProductLinks(product),
    relatedProductIds: product.relatedProductIds ?? [],
    ogImage: product.ogImage || product.image,
  };
}

export function normalizeProducts(products: SiteContent["products"]) {
  return products.map(normalizeProduct);
}

export function findProductBySlug(products: SiteContent["products"], slug: string) {
  return normalizeProducts(products).find((product) => product.slug === slug) ?? null;
}

export function getProductCategories(site: SiteContent["site"], products: SiteContent["products"]) {
  if (site.productCategories && site.productCategories.length > 0) {
    return site.productCategories;
  }

  const fallback: ProductCategory[] = [];

  for (const product of products) {
    const id = product.category?.trim();

    if (!id || fallback.some((entry) => entry.id === id)) {
      continue;
    }

    fallback.push({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
    });
  }

  return [{ id: "alla", name: "Alla", icon: "🍺" }, ...fallback];
}

export function getHomepageFeaturedProducts(site: SiteContent["site"], products: SiteContent["products"]) {
  const normalized = normalizeProducts(products);

  if (site.featuredProductIds && site.featuredProductIds.length > 0) {
    const picked = site.featuredProductIds
      .map((id) => normalized.find((product) => product.id === id))
      .filter((product): product is ProductWithComputedFields => Boolean(product));

    if (picked.length > 0) {
      return picked;
    }
  }

  return normalized.filter((product) => product.featured);
}

export function getRelatedProducts(products: SiteContent["products"], currentProductId: string, relatedIds?: string[]) {
  const normalized = normalizeProducts(products);
  const explicitIds = relatedIds ?? normalized.find((product) => product.id === currentProductId)?.relatedProductIds ?? [];

  if (explicitIds.length > 0) {
    return explicitIds
      .map((id) => normalized.find((product) => product.id === id && product.id !== currentProductId))
      .filter((product): product is ProductWithComputedFields => Boolean(product));
  }

  const current = normalized.find((product) => product.id === currentProductId);

  if (!current) {
    return [];
  }

  return normalized
    .filter((product) => product.id !== currentProductId && product.category === current.category)
    .slice(0, 3);
}
