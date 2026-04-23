import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";
import {
  summarizeQualityIssues,
  validateHomepage,
  validateNewsItem,
  validateProduct,
  validateRecipe,
  validateRullerietPost,
  validateRullerietSection,
  validateService,
  type QualityIssue,
} from "@/lib/content-quality";
import { getPublishingStatus, getPublishingStatusLabel, type PublishingStatus } from "@/lib/publishing";

export type DashboardTrackedSection =
  | "homepage"
  | "products"
  | "news"
  | "services"
  | "recipes"
  | "rulleriet"
  | "rullerietPosts";

export type DashboardAttentionItem = {
  id: string;
  title: string;
  section: DashboardTrackedSection;
  sectionLabel: string;
  itemTypeLabel: string;
  publishingStatus?: PublishingStatus;
  publishingStatusLabel?: string;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  errors: number;
  warnings: number;
};

export type DashboardUpcomingItem = {
  id: string;
  title: string;
  section: DashboardTrackedSection;
  sectionLabel: string;
  itemTypeLabel: string;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  dateLabel: string;
  timestamp: number;
};

export type DashboardOverview = {
  totalTrackedItems: number;
  publishing: Record<PublishingStatus, number>;
  quality: {
    errors: number;
    warnings: number;
    itemsWithErrors: number;
    itemsWithWarnings: number;
  };
  attentionItems: DashboardAttentionItem[];
  upcomingItems: DashboardUpcomingItem[];
};

type TrackedItem = {
  id: string;
  title: string;
  section: DashboardTrackedSection;
  sectionLabel: string;
  itemTypeLabel: string;
  publishingStatus?: PublishingStatus;
  qualityIssues: QualityIssue[];
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  sortTimestamp?: number;
  sortLabel?: string;
};

const sectionLabels: Record<DashboardTrackedSection, string> = {
  homepage: "Förstasida",
  products: "Produkter",
  news: "Nyheter",
  services: "Tjänster",
  recipes: "Recept",
  rulleriet: "Rulleriet",
  rullerietPosts: "Rulleriet-inlägg",
};

function getTrackedSectionsForPermissions(allowedSections: CmsManagedSection[]) {
  return new Set(
    allowedSections.filter((section): section is DashboardTrackedSection =>
      ["homepage", "products", "news", "services", "recipes", "rulleriet", "rullerietPosts"].includes(section),
    ),
  );
}

function toTimestamp(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createTrackedItem(item: TrackedItem) {
  return item;
}

export function buildCmsDashboard(content: SiteContent, allowedSections: CmsManagedSection[], now = Date.now()): DashboardOverview {
  const trackedSections = getTrackedSectionsForPermissions(allowedSections);
  const items: TrackedItem[] = [];

  if (trackedSections.has("homepage")) {
    items.push(createTrackedItem({
      id: "homepage",
      title: "Förstasida",
      section: "homepage",
      sectionLabel: sectionLabels.homepage,
      itemTypeLabel: "Sida",
      qualityIssues: validateHomepage(content.homepage),
    }));
  }

  if (trackedSections.has("products")) {
    content.products.forEach((product) => {
      items.push(createTrackedItem({
        id: product.id,
        title: product.name,
        section: "products",
        sectionLabel: sectionLabels.products,
        itemTypeLabel: "Produkt",
        publishingStatus: getPublishingStatus(product, now),
        qualityIssues: validateProduct(product),
        targetId: product.id,
        targetTab: "products",
        sortTimestamp: toTimestamp(product.publishedAt),
        sortLabel: product.publishedAt,
      }));
    });
  }

  if (trackedSections.has("news")) {
    content.news.forEach((item) => {
      items.push(createTrackedItem({
        id: item.id,
        title: item.title,
        section: "news",
        sectionLabel: sectionLabels.news,
        itemTypeLabel: "Nyhet",
        publishingStatus: getPublishingStatus(item, now),
        qualityIssues: validateNewsItem(item),
        targetId: item.id,
        sortTimestamp: toTimestamp(item.publishedAt),
        sortLabel: item.publishedAt,
      }));
    });
  }

  if (trackedSections.has("services")) {
    content.services.forEach((service) => {
      items.push(createTrackedItem({
        id: service.id,
        title: service.title,
        section: "services",
        sectionLabel: sectionLabels.services,
        itemTypeLabel: "Tjänst",
        publishingStatus: getPublishingStatus(service, now),
        qualityIssues: validateService(service),
        targetId: service.id,
        targetTab: "services",
        sortTimestamp: toTimestamp(service.publishedAt),
        sortLabel: service.publishedAt,
      }));
    });
  }

  if (trackedSections.has("recipes")) {
    content.recipes.forEach((recipe) => {
      items.push(createTrackedItem({
        id: recipe.id,
        title: recipe.title,
        section: "recipes",
        sectionLabel: sectionLabels.recipes,
        itemTypeLabel: "Recept",
        publishingStatus: getPublishingStatus(recipe, now),
        qualityIssues: validateRecipe(recipe),
        targetId: recipe.id,
        targetTab: "recipes",
        sortTimestamp: toTimestamp(recipe.publishedAt),
        sortLabel: recipe.publishedAt,
      }));
    });
  }

  if (trackedSections.has("rulleriet")) {
    const sectionIssues = validateRullerietSection(content.rulleriet);
    items.push(createTrackedItem({
      id: "rulleriet-page",
      title: "Rulleriet-sidan",
      section: "rulleriet",
      sectionLabel: sectionLabels.rulleriet,
      itemTypeLabel: "Sida",
      qualityIssues: sectionIssues.filter((issue) => !issue.field.startsWith("event:")),
    }));

    content.rulleriet.events.forEach((event, index) => {
      const issuePrefix = `event:${event.id}:`;
      items.push(createTrackedItem({
        id: event.id,
        title: event.title || `Evenemang ${index + 1}`,
        section: "rulleriet",
        sectionLabel: sectionLabels.rulleriet,
        itemTypeLabel: "Evenemang",
        publishingStatus: getPublishingStatus(event, now),
        qualityIssues: sectionIssues.filter((issue) => issue.field.startsWith(issuePrefix)),
        targetAnchorId: `rulleriet-event-${event.id}`,
        sortTimestamp: toTimestamp(`${event.date}T${event.time || "00:00"}`),
        sortLabel: `${event.date}${event.time ? ` ${event.time}` : ""}`.trim(),
      }));
    });
  }

  if (trackedSections.has("rullerietPosts")) {
    content.rulleriet.blogPosts.forEach((post) => {
      items.push(createTrackedItem({
        id: post.id,
        title: post.title,
        section: "rullerietPosts",
        sectionLabel: sectionLabels.rullerietPosts,
        itemTypeLabel: "Inlägg",
        publishingStatus: getPublishingStatus(post, now),
        qualityIssues: validateRullerietPost(post),
        targetId: post.id,
        sortTimestamp: toTimestamp(post.publishedAt),
        sortLabel: post.publishedAt,
      }));
    });
  }

  const publishing = items.reduce<Record<PublishingStatus, number>>(
    (summary, item) => {
      if (item.publishingStatus) {
        summary[item.publishingStatus] += 1;
      }
      return summary;
    },
    { draft: 0, scheduled: 0, published: 0, expired: 0 },
  );

  const attentionItems = items
    .map((item) => {
      const quality = summarizeQualityIssues(item.qualityIssues);
      return {
        id: `${item.section}:${item.id}`,
        title: item.title,
        section: item.section,
        sectionLabel: item.sectionLabel,
        itemTypeLabel: item.itemTypeLabel,
        publishingStatus: item.publishingStatus,
        publishingStatusLabel: item.publishingStatus ? getPublishingStatusLabel(item.publishingStatus) : undefined,
        targetId: item.targetId,
        targetTab: item.targetTab,
        targetAnchorId: item.targetAnchorId,
        errors: quality.errors,
        warnings: quality.warnings,
      };
    })
    .filter((item) => item.errors > 0 || item.warnings > 0)
    .sort((left, right) => {
      if (left.errors !== right.errors) {
        return right.errors - left.errors;
      }
      if (left.warnings !== right.warnings) {
        return right.warnings - left.warnings;
      }
      return left.title.localeCompare(right.title, "sv-SE");
    });

  const upcomingItems = items
    .filter((item) => item.sortTimestamp && item.sortTimestamp > now)
    .sort((left, right) => (left.sortTimestamp ?? 0) - (right.sortTimestamp ?? 0))
    .slice(0, 8)
    .map((item) => ({
      id: `${item.section}:${item.id}`,
      title: item.title,
      section: item.section,
      sectionLabel: item.sectionLabel,
      itemTypeLabel: item.itemTypeLabel,
      targetId: item.targetId,
      targetTab: item.targetTab,
      targetAnchorId: item.targetAnchorId,
      dateLabel: item.sortLabel ? formatDateLabel(item.sortLabel) : "Framtida datum",
      timestamp: item.sortTimestamp ?? 0,
    }));

  const quality = attentionItems.reduce(
    (summary, item) => ({
      errors: summary.errors + item.errors,
      warnings: summary.warnings + item.warnings,
      itemsWithErrors: summary.itemsWithErrors + (item.errors > 0 ? 1 : 0),
      itemsWithWarnings: summary.itemsWithWarnings + (item.warnings > 0 ? 1 : 0),
    }),
    { errors: 0, warnings: 0, itemsWithErrors: 0, itemsWithWarnings: 0 },
  );

  return {
    totalTrackedItems: items.length,
    publishing,
    quality,
    attentionItems: attentionItems.slice(0, 10),
    upcomingItems,
  };
}
