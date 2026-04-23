import type { ProductEntry, RullerietEvent, SiteContent } from "@/lib/content-schema";
import { getPublishingStatus, type PublishableFields } from "@/lib/publishing";

export type QualityIssue = {
  severity: "error" | "warning";
  code: string;
  field: string;
  message: string;
};

type HomepageContent = SiteContent["homepage"];
type RullerietSection = SiteContent["rulleriet"];
type ServiceEntry = SiteContent["services"][number];
type RecipeEntry = SiteContent["recipes"][number];
type NewsEntry = SiteContent["news"][number];
type RullerietPost = SiteContent["rulleriet"]["blogPosts"][number];

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDateString(value: string | null | undefined) {
  if (!hasText(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(String(value)));
}

function parseEventStart(event: RullerietEvent) {
  if (!hasText(event.date)) {
    return null;
  }

  const time = hasText(event.time) ? event.time : "00:00";
  const parsed = new Date(`${event.date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function createIssue(issue: QualityIssue): QualityIssue {
  return issue;
}

function requireText(
  issues: QualityIssue[],
  value: string | null | undefined,
  options: { field: string; code: string; message: string; severity?: "error" | "warning" },
) {
  if (!hasText(value)) {
    issues.push(createIssue({
      severity: options.severity ?? "error",
      field: options.field,
      code: options.code,
      message: options.message,
    }));
  }
}

function requireImage(
  issues: QualityIssue[],
  value: string | null | undefined,
  options: { field: string; code: string; message: string; severity?: "error" | "warning" },
) {
  requireText(issues, value, options);
}

function requireLinkIfLabelExists(
  issues: QualityIssue[],
  label: string | null | undefined,
  url: string | null | undefined,
  options: { field: string; code: string; message: string; severity?: "error" | "warning" },
) {
  if (hasText(label) && !hasText(url)) {
    issues.push(createIssue({
      severity: options.severity ?? "error",
      field: options.field,
      code: options.code,
      message: options.message,
    }));
  }
}

function warnIfLong(
  issues: QualityIssue[],
  value: string | null | undefined,
  options: { field: string; code: string; message: string; maxLength: number },
) {
  if (hasText(value) && String(value).trim().length > options.maxLength) {
    issues.push(createIssue({
      severity: "warning",
      field: options.field,
      code: options.code,
      message: options.message,
    }));
  }
}

function warnIfPastDateStillPublished(
  issues: QualityIssue[],
  item: PublishableFields,
  eventDate: Date | null,
  options: { field: string; code: string; message: string; now?: Date },
) {
  const now = options.now ?? new Date();
  const publishingStatus = getPublishingStatus(item, now.getTime());

  if (eventDate && eventDate.getTime() < now.getTime() && (publishingStatus === "published" || publishingStatus === "scheduled")) {
    issues.push(createIssue({
      severity: "warning",
      field: options.field,
      code: options.code,
      message: options.message,
    }));
  }
}

export function summarizeQualityIssues(issues: QualityIssue[]) {
  return {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
  };
}

export function getQualityIssuesForField(issues: QualityIssue[], field: string) {
  return issues.filter((issue) => issue.field === field);
}

export function validateProduct(product: ProductEntry): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, product.name, {
    field: "name",
    code: "product.name.required",
    message: "Produktnamn saknas.",
  });
  requireText(issues, product.slug, {
    field: "slug",
    code: "product.slug.required",
    message: "Slug saknas.",
  });
  requireImage(issues, product.image, {
    field: "image",
    code: "product.image.required",
    message: "Produktbild saknas.",
  });
  requireText(issues, product.description, {
    field: "description",
    code: "product.description.required",
    message: "Kort beskrivning saknas.",
  });

  const hasExternalLink = hasText(product.systembolaget) || (product.links ?? []).some((link) => hasText(link.label) && hasText(link.url));
  if (!hasExternalLink) {
    issues.push(createIssue({
      severity: "error",
      field: "systembolaget",
      code: "product.external_link.required",
      message: "Produktlänk saknas. Lägg till Systembolaget-länk eller en extra produktlänk.",
    }));
  }

  requireText(issues, product.seoTitle, {
    field: "seoTitle",
    code: "product.seo_title.required",
    message: "SEO-titel saknas.",
    severity: "warning",
  });
  requireText(issues, product.seoDescription, {
    field: "seoDescription",
    code: "product.seo_description.required",
    message: "SEO-beskrivning saknas.",
    severity: "warning",
  });
  requireText(issues, product.artikelnummer, {
    field: "artikelnummer",
    code: "product.article_number.recommended",
    message: "Artikelnummer saknas.",
    severity: "warning",
  });
  warnIfLong(issues, product.description, {
    field: "description",
    code: "product.description.long",
    message: "Den korta beskrivningen är ovanligt lång och kan bli svår i kortlayouter.",
    maxLength: 220,
  });

  return issues;
}

export function validateHomepage(homepage: HomepageContent): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, homepage.heroTitle, {
    field: "heroTitle",
    code: "homepage.hero_title.required",
    message: "Hero-rubrik saknas.",
  });
  requireImage(issues, homepage.heroBackgroundImage, {
    field: "heroBackgroundImage",
    code: "homepage.hero_image.required",
    message: "Hero-bild saknas.",
  });
  requireLinkIfLabelExists(issues, homepage.heroPrimaryCtaLabel, homepage.heroPrimaryCtaLink, {
    field: "heroPrimaryCtaLink",
    code: "homepage.hero_primary_cta_link.required",
    message: "Primär hero-knapp har text men saknar länk.",
  });
  requireLinkIfLabelExists(issues, homepage.heroSecondaryCtaLabel, homepage.heroSecondaryCtaLink, {
    field: "heroSecondaryCtaLink",
    code: "homepage.hero_secondary_cta_link.required",
    message: "Sekundär hero-knapp har text men saknar länk.",
  });
  requireText(issues, homepage.productsTitle, {
    field: "productsTitle",
    code: "homepage.products_title.required",
    message: "Rubrik för produktblocket saknas.",
  });
  requireText(issues, homepage.newsTitle, {
    field: "newsTitle",
    code: "homepage.news_title.required",
    message: "Rubrik för nyhetsblocket saknas.",
    severity: "warning",
  });
  requireText(issues, homepage.servicesTitle, {
    field: "servicesTitle",
    code: "homepage.services_title.required",
    message: "Rubrik för tjänsteblocket saknas.",
    severity: "warning",
  });
  requireText(issues, homepage.ctaTitle, {
    field: "ctaTitle",
    code: "homepage.cta_title.required",
    message: "Nedre CTA-rubrik saknas.",
  });
  requireLinkIfLabelExists(issues, homepage.ctaPrimaryLabel, homepage.ctaPrimaryLink, {
    field: "ctaPrimaryLink",
    code: "homepage.cta_primary_link.required",
    message: "Primär CTA-knapp längst ner har text men saknar länk.",
  });
  requireLinkIfLabelExists(issues, homepage.ctaSecondaryLabel, homepage.ctaSecondaryLink, {
    field: "ctaSecondaryLink",
    code: "homepage.cta_secondary_link.required",
    message: "Sekundär CTA-knapp längst ner har text men saknar länk.",
  });
  requireImage(issues, homepage.anniversaryImage, {
    field: "anniversaryImage",
    code: "homepage.anniversary_image.recommended",
    message: "Jubileumsbild saknas.",
    severity: "warning",
  });
  warnIfLong(issues, homepage.heroLead, {
    field: "heroLead",
    code: "homepage.hero_lead.long",
    message: "Hero-ingressen är ovanligt lång och kan bli tung i layouten.",
    maxLength: 180,
  });

  return issues;
}

export function validateService(service: ServiceEntry): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, service.title, {
    field: "title",
    code: "service.title.required",
    message: "Tjänstetitel saknas.",
  });
  requireText(issues, service.shortDescription, {
    field: "shortDescription",
    code: "service.short_description.required",
    message: "Kort beskrivning saknas.",
  });
  requireText(issues, service.link, {
    field: "link",
    code: "service.link.required",
    message: "Länk saknas.",
  });
  if ((service.bodyParagraphs ?? []).filter((item) => hasText(item)).length === 0) {
    issues.push(createIssue({
      severity: "warning",
      field: "bodyParagraphs",
      code: "service.body_paragraphs.recommended",
      message: "Brödtext saknas.",
    }));
  }
  requireText(issues, service.seoTitle, {
    field: "seoTitle",
    code: "service.seo_title.recommended",
    message: "SEO-titel saknas.",
    severity: "warning",
  });
  requireText(issues, service.seoDescription, {
    field: "seoDescription",
    code: "service.seo_description.recommended",
    message: "SEO-beskrivning saknas.",
    severity: "warning",
  });

  if (hasText(service.publishedAt) && !isValidDateString(service.publishedAt)) {
    issues.push(createIssue({
      severity: "error",
      field: "publishedAt",
      code: "service.published_at.invalid",
      message: "Publiceringsdatum är ogiltigt.",
    }));
  }

  return issues;
}

export function validateRecipe(recipe: RecipeEntry): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, recipe.title, {
    field: "title",
    code: "recipe.title.required",
    message: "Recepttitel saknas.",
  });
  requireText(issues, recipe.description, {
    field: "description",
    code: "recipe.description.required",
    message: "Receptbeskrivning saknas.",
  });
  requireImage(issues, recipe.image, {
    field: "image",
    code: "recipe.image.required",
    message: "Receptbild saknas.",
  });

  if ((recipe.ingredients ?? []).filter((item) => hasText(item)).length === 0) {
    issues.push(createIssue({
      severity: "error",
      field: "ingredients",
      code: "recipe.ingredients.required",
      message: "Ingredienslista saknas.",
    }));
  }

  if ((recipe.instructions ?? []).filter((item) => hasText(item)).length === 0) {
    issues.push(createIssue({
      severity: "error",
      field: "instructions",
      code: "recipe.instructions.required",
      message: "Instruktioner saknas.",
    }));
  }

  requireText(issues, recipe.pairing, {
    field: "pairing",
    code: "recipe.pairing.recommended",
    message: "Dryckesmatchning saknas.",
    severity: "warning",
  });
  requireText(issues, recipe.seoTitle, {
    field: "seoTitle",
    code: "recipe.seo_title.recommended",
    message: "SEO-titel saknas.",
    severity: "warning",
  });
  requireText(issues, recipe.seoDescription, {
    field: "seoDescription",
    code: "recipe.seo_description.recommended",
    message: "SEO-beskrivning saknas.",
    severity: "warning",
  });

  return issues;
}

export function validateNewsItem(item: NewsEntry): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, item.title, {
    field: "title",
    code: "news.title.required",
    message: "Nyhetstitel saknas.",
  });
  requireText(issues, item.date, {
    field: "date",
    code: "news.date.required",
    message: "Datum saknas.",
  });
  requireImage(issues, item.image, {
    field: "image",
    code: "news.image.required",
    message: "Nyhetsbild saknas.",
  });
  requireText(issues, item.link, {
    field: "link",
    code: "news.link.required",
    message: "Länk saknas.",
  });
  requireText(issues, item.excerpt, {
    field: "excerpt",
    code: "news.excerpt.required",
    message: "Ingress saknas.",
    severity: "warning",
  });

  return issues;
}

export function validateRullerietPost(post: RullerietPost): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, post.title, {
    field: "title",
    code: "rulleriet.post.title.required",
    message: "Inläggstitel saknas.",
  });
  requireText(issues, post.slug, {
    field: "slug",
    code: "rulleriet.post.slug.required",
    message: "Slug saknas.",
  });
  requireText(issues, post.excerpt, {
    field: "excerpt",
    code: "rulleriet.post.excerpt.required",
    message: "Ingress saknas.",
  });
  requireText(issues, post.content, {
    field: "content",
    code: "rulleriet.post.content.required",
    message: "Innehåll saknas.",
  });
  requireImage(issues, post.image, {
    field: "image",
    code: "rulleriet.post.image.required",
    message: "Inläggsbild saknas.",
  });
  requireText(issues, post.publishedAt, {
    field: "publishedAt",
    code: "rulleriet.post.published_at.required",
    message: "Publiceringsdatum saknas.",
  });
  requireText(issues, post.seoTitle, {
    field: "seoTitle",
    code: "rulleriet.post.seo_title.recommended",
    message: "SEO-titel saknas.",
    severity: "warning",
  });
  requireText(issues, post.seoDescription, {
    field: "seoDescription",
    code: "rulleriet.post.seo_description.recommended",
    message: "SEO-beskrivning saknas.",
    severity: "warning",
  });

  return issues;
}

export function validateRullerietEvent(event: RullerietEvent, options?: { now?: Date; index?: number }): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const label = hasText(event.title) ? event.title.trim() : `Evenemang ${typeof options?.index === "number" ? options.index + 1 : ""}`.trim();
  const eventStart = parseEventStart(event);
  const fieldPrefix = `event:${event.id}`;

  requireText(issues, event.title, {
    field: `${fieldPrefix}:title`,
    code: "rulleriet.event.title.required",
    message: `${label}: titel saknas.`,
  });
  requireText(issues, event.date, {
    field: `${fieldPrefix}:date`,
    code: "rulleriet.event.date.required",
    message: `${label}: datum saknas.`,
  });
  requireText(issues, event.time, {
    field: `${fieldPrefix}:time`,
    code: "rulleriet.event.time.required",
    message: `${label}: starttid saknas.`,
  });
  requireText(issues, event.description, {
    field: `${fieldPrefix}:description`,
    code: "rulleriet.event.description.required",
    message: `${label}: beskrivning saknas.`,
  });
  requireImage(issues, event.image, {
    field: `${fieldPrefix}:image`,
    code: "rulleriet.event.image.recommended",
    message: `${label}: evenemangsbild saknas.`,
    severity: "warning",
  });

  if (hasText(event.publishedAt) && !isValidDateString(event.publishedAt)) {
    issues.push(createIssue({
      severity: "error",
      field: `${fieldPrefix}:publishedAt`,
      code: "rulleriet.event.published_at.invalid",
      message: `${label}: publiceringsdatum är ogiltigt.`,
    }));
  }

  if (hasText(event.unpublishedAt) && !isValidDateString(event.unpublishedAt)) {
    issues.push(createIssue({
      severity: "error",
      field: `${fieldPrefix}:unpublishedAt`,
      code: "rulleriet.event.unpublished_at.invalid",
      message: `${label}: avpubliceringsdatum är ogiltigt.`,
    }));
  }

  if (hasText(event.publishedAt) && hasText(event.unpublishedAt) && isValidDateString(event.publishedAt) && isValidDateString(event.unpublishedAt)) {
    if (new Date(event.unpublishedAt as string).getTime() < new Date(event.publishedAt as string).getTime()) {
      issues.push(createIssue({
        severity: "error",
        field: `${fieldPrefix}:unpublishedAt`,
        code: "rulleriet.event.unpublished_before_published",
        message: `${label}: avpubliceringsdatum ligger före publiceringsdatum.`,
      }));
    }
  }

  warnIfPastDateStillPublished(issues, event, eventStart, {
    field: `${fieldPrefix}:date`,
    code: "rulleriet.event.past_but_published",
    message: `${label}: datumet har passerat men evenemanget är fortfarande publicerat.`,
    now: options?.now,
  });

  return issues;
}

export function validateRullerietSection(section: RullerietSection, options?: { now?: Date }): QualityIssue[] {
  const issues: QualityIssue[] = [];

  requireText(issues, section.heroTitle, {
    field: "heroTitle",
    code: "rulleriet.hero_title.required",
    message: "Rulleriet-sidan saknar hero-rubrik.",
  });
  requireImage(issues, section.heroImage, {
    field: "heroImage",
    code: "rulleriet.hero_image.required",
    message: "Rulleriet-sidan saknar hero-bild.",
  });
  requireText(issues, section.introTitle, {
    field: "introTitle",
    code: "rulleriet.intro_title.required",
    message: "Rulleriet-sidan saknar intro-rubrik.",
    severity: "warning",
  });

  section.events.forEach((event, index) => {
    issues.push(...validateRullerietEvent(event, { now: options?.now, index }));
  });

  return issues;
}
