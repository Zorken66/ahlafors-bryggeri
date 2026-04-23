export type PublishableFields = {
  published?: boolean;
  publishedAt?: string;
  unpublishedAt?: string;
};

export type PublishingStatus = "draft" | "scheduled" | "published" | "expired";

function normalizeDateValue(value: string | undefined) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : undefined;
}

function parseDateValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  const timestamp = parsed.getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function normalizePublishingFields<T extends PublishableFields>(item: T): T {
  return {
    ...item,
    published: typeof item.published === "boolean" ? item.published : true,
    publishedAt: normalizeDateValue(item.publishedAt),
    unpublishedAt: normalizeDateValue(item.unpublishedAt),
  };
}

export function getPublishingStatus(item: PublishableFields, now = Date.now()): PublishingStatus {
  const normalized = normalizePublishingFields(item);
  const publishedAt = parseDateValue(normalized.publishedAt);
  const unpublishedAt = parseDateValue(normalized.unpublishedAt);

  if (normalized.published === false) {
    return "draft";
  }

  if (publishedAt !== null && publishedAt > now) {
    return "scheduled";
  }

  if (unpublishedAt !== null && unpublishedAt <= now) {
    return "expired";
  }

  return "published";
}

export function isPublishedNow(item: PublishableFields, now = Date.now()) {
  return getPublishingStatus(item, now) === "published";
}

export function getPublishingStatusLabel(status: PublishingStatus) {
  switch (status) {
    case "draft":
      return "Utkast";
    case "scheduled":
      return "Schemalagd";
    case "expired":
      return "Utgången";
    default:
      return "Publik";
  }
}
