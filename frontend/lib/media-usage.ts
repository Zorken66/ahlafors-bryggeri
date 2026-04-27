import "server-only";

import type { SiteContent } from "@/lib/content-schema";

export type CmsMediaUsageEntry = {
  section: string;
  sectionLabel: string;
  field: string;
  targetField?: string;
  itemId?: string;
  itemLabel: string;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
};

export type CmsMediaReference = {
  publicUrl: string;
  usage: CmsMediaUsageEntry[];
};

function normalizeMediaUrl(value: string | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.replace("/uploads/", "/media/");
  }

  return trimmed;
}

function pushUsage(
  usages: CmsMediaUsageEntry[],
  needle: string,
  value: string | null | undefined,
  usage: CmsMediaUsageEntry,
) {
  if (normalizeMediaUrl(value) === needle) {
    usages.push(usage);
  }
}

export function getMediaUsage(content: SiteContent, publicUrl: string): CmsMediaUsageEntry[] {
  const needle = normalizeMediaUrl(publicUrl);

  if (!needle) {
    return [];
  }

  const usages: CmsMediaUsageEntry[] = [];

  pushUsage(usages, needle, content.site.ogImage, {
    section: "site",
    sectionLabel: "Sajtinställningar",
    field: "ogImage",
    targetField: "ogImage",
    itemLabel: "Open Graph-bild",
  });

  pushUsage(usages, needle, content.homepage.heroBackgroundImage, {
    section: "homepage",
    sectionLabel: "Förstasida",
    field: "heroBackgroundImage",
    targetField: "heroBackgroundImage",
    itemLabel: "Hero",
  });
  pushUsage(usages, needle, content.homepage.anniversaryImage, {
    section: "homepage",
    sectionLabel: "Förstasida",
    field: "anniversaryImage",
    targetField: "anniversaryImage",
    itemLabel: "Jubileumssektion",
  });

  pushUsage(usages, needle, content.about.homepageImage, {
    section: "about",
    sectionLabel: "Om oss",
    field: "homepageImage",
    targetField: "homepageImage",
    itemLabel: "Förstasidebild",
  });
  pushUsage(usages, needle, content.about.pageHeroImage, {
    section: "about",
    sectionLabel: "Om oss",
    field: "pageHeroImage",
    targetField: "pageHeroImage",
    itemLabel: "Sidohero",
  });
  pushUsage(usages, needle, content.about.historyImage, {
    section: "about",
    sectionLabel: "Om oss",
    field: "historyImage",
    targetField: "historyImage",
    itemLabel: "Historiebild",
  });

  pushUsage(usages, needle, content.productsPage.heroImage, {
    section: "products",
    sectionLabel: "Produkter",
    field: "productsPage.heroImage",
    targetField: "heroImage",
    itemLabel: "Produktsidans hero",
    targetTab: "page",
  });

  content.products.forEach((product) => {
    pushUsage(usages, needle, product.image, {
      section: "products",
      sectionLabel: "Produkter",
      field: "image",
      targetField: "image",
      itemId: product.id,
      itemLabel: product.name,
      targetId: product.id,
      targetTab: "products",
    });
    pushUsage(usages, needle, product.ogImage, {
      section: "products",
      sectionLabel: "Produkter",
      field: "ogImage",
      targetField: "ogImage",
      itemId: product.id,
      itemLabel: `${product.name} (OG-bild)`,
      targetId: product.id,
      targetTab: "products",
    });
  });

  content.news.forEach((item) => {
    pushUsage(usages, needle, item.image, {
      section: "news",
      sectionLabel: "Nyheter",
      field: "image",
      targetField: "image",
      itemId: item.id,
      itemLabel: item.title,
      targetId: item.id,
    });
  });

  pushUsage(usages, needle, content.servicesPage.heroImage, {
    section: "services",
    sectionLabel: "Tjänster",
    field: "servicesPage.heroImage",
    targetField: "heroImage",
    itemLabel: "Tjänstesidans hero",
    targetTab: "page",
  });

  content.services.forEach((service) => {
    pushUsage(usages, needle, service.image, {
      section: "services",
      sectionLabel: "Tjänster",
      field: "image",
      targetField: "image",
      itemId: service.id,
      itemLabel: service.title,
      targetId: service.id,
      targetTab: "services",
    });
  });

  pushUsage(usages, needle, content.recipesPage.heroImage, {
    section: "recipes",
    sectionLabel: "Recept",
    field: "recipesPage.heroImage",
    targetField: "heroImage",
    itemLabel: "Receptsidan hero",
    targetTab: "page",
  });

  content.recipes.forEach((recipe) => {
    pushUsage(usages, needle, recipe.image, {
      section: "recipes",
      sectionLabel: "Recept",
      field: "image",
      targetField: "image",
      itemId: recipe.id,
      itemLabel: recipe.title,
      targetId: recipe.id,
      targetTab: "recipes",
    });
  });

  pushUsage(usages, needle, content.rulleriet.heroImage, {
    section: "rulleriet",
    sectionLabel: "Rulleriet",
    field: "heroImage",
    targetField: "heroImage",
    itemLabel: "Rulleriets hero",
  });

  content.rulleriet.events.forEach((event, index) => {
    pushUsage(usages, needle, event.image, {
      section: "rulleriet",
      sectionLabel: "Rulleriet",
      field: "image",
      targetField: `event:${event.id}:image`,
      itemId: event.id,
      itemLabel: event.title || `Evenemang ${index + 1}`,
      targetAnchorId: `rulleriet-event-${event.id}`,
    });
  });

  content.rulleriet.blogPosts.forEach((post) => {
    pushUsage(usages, needle, post.image, {
      section: "rullerietPosts",
      sectionLabel: "Rulleriet-inlägg",
      field: "image",
      targetField: "image",
      itemId: post.id,
      itemLabel: post.title,
      targetId: post.id,
    });
  });

  pushUsage(usages, needle, content.contact.heroImage, {
    section: "contact",
    sectionLabel: "Kontakt",
    field: "heroImage",
    targetField: "heroImage",
    itemLabel: "Kontaktsidans hero",
  });

  return usages;
}

export function collectMediaReferences(content: SiteContent): CmsMediaReference[] {
  const references = new Map<string, CmsMediaUsageEntry[]>();

  function addReference(value: string | null | undefined) {
    const normalized = normalizeMediaUrl(value);

    if (!normalized) {
      return;
    }

    const usage = getMediaUsage(content, normalized);

    if (usage.length === 0) {
      return;
    }

    references.set(normalized, usage);
  }

  addReference(content.site.ogImage);
  addReference(content.homepage.heroBackgroundImage);
  addReference(content.homepage.anniversaryImage);
  addReference(content.about.homepageImage);
  addReference(content.about.pageHeroImage);
  addReference(content.about.historyImage);
  addReference(content.productsPage.heroImage);
  addReference(content.servicesPage.heroImage);
  addReference(content.recipesPage.heroImage);
  addReference(content.rulleriet.heroImage);
  addReference(content.contact.heroImage);

  content.products.forEach((product) => {
    addReference(product.image);
    addReference(product.ogImage);
  });

  content.news.forEach((item) => {
    addReference(item.image);
  });

  content.services.forEach((service) => {
    addReference(service.image);
  });

  content.recipes.forEach((recipe) => {
    addReference(recipe.image);
  });

  content.rulleriet.events.forEach((event) => {
    addReference(event.image);
  });

  content.rulleriet.blogPosts.forEach((post) => {
    addReference(post.image);
  });

  return Array.from(references.entries()).map(([publicUrl, usage]) => ({
    publicUrl,
    usage,
  }));
}
