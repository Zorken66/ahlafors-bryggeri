import "server-only";

import type { SiteContent } from "@/lib/content-schema";
import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import { assertSiteContent } from "@/lib/content-schema";
import { logInfo } from "@/lib/cms-logger";

export type ContentRevision = {
  id: number;
  sectionKey: string;
  sectionLabel: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

export type ContentRevisionDetail = ContentRevision & {
  revisionContent: string;
  currentContent: string;
  diffSummary: {
    totalChanges: number;
    added: number;
    removed: number;
    changed: number;
  };
  diffEntries: Array<{
    path: string;
    label: string;
    changeType: "added" | "removed" | "changed";
    previousValue: string;
    currentValue: string;
  }>;
  groupedDiffEntries: Array<{
    groupKey: string;
    groupLabel: string;
    totalChanges: number;
    entries: Array<{
      path: string;
      label: string;
      changeType: "added" | "removed" | "changed";
      previousValue: string;
      currentValue: string;
    }>;
  }>;
};

type ContentRevisionRow = {
  id: number;
  section_key: string;
  changed_by: string;
  change_summary: string | null;
  created_at: string;
};

type RevisionDiffEntry = ContentRevisionDetail["diffEntries"][number];

const SECTION_LABELS: Record<string, string> = {
  site: "Site",
  homepage: "Förstasida",
  about: "Om oss",
  productsPage: "Produktsida",
  productDetailPage: "Produktdetalj",
  products: "Produkter",
  news: "Nyheter",
  services: "Tjänster",
  servicesPage: "Tjänstesida",
  recipes: "Recept",
  recipesPage: "Receptsida",
  rulleriet: "Rulleriet",
  rullerietPosts: "Rulleriet-inlägg",
  contact: "Kontakt",
};

function getSectionLabel(sectionKey: string) {
  return SECTION_LABELS[sectionKey] ?? sectionKey;
}

function stringifyValue(value: unknown) {
  if (value === undefined) {
    return "Tomt";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value.trim() ? value : "Tom sträng";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "Tom lista" : `${value.length} poster`;
  }

  if (typeof value === "object") {
    return `${Object.keys(value).length} fält`;
  }

  return JSON.stringify(value);
}

function formatDiffLabel(path: string) {
  return path
    .replace(/\[(\d+)\]/g, " #$1")
    .replace(/\./g, " / ");
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function tokenizePath(path: string) {
  const tokens: Array<string | number> = [];
  const matcher = /([^[.\]]+)|\[(\d+)\]/g;

  for (const match of path.matchAll(matcher)) {
    if (match[1]) {
      tokens.push(match[1]);
    } else if (match[2]) {
      tokens.push(Number(match[2]));
    }
  }

  return tokens;
}

function getValueAtPath(value: unknown, path: string) {
  if (!path || path === "root") {
    return value;
  }

  return tokenizePath(path).reduce<unknown>((current, token) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof token === "number") {
      return Array.isArray(current) ? current[token] : undefined;
    }

    return typeof current === "object" ? (current as Record<string, unknown>)[token] : undefined;
  }, value);
}

function getObjectDisplayLabel(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const candidates = ["name", "title", "displayName", "slug", "id", "date"];

  for (const candidate of candidates) {
    const resolved = record[candidate];
    if (typeof resolved === "string" && resolved.trim()) {
      return resolved.trim();
    }
  }

  return null;
}

function getDiffGroupMeta(path: string, revisionSection: unknown, currentSection: unknown) {
  const arrayItemMatch = path.match(/^(.*?\[\d+\])/);

  if (!arrayItemMatch) {
    const topLevelSegment = path.split(".")[0] ?? path;
    return {
      groupKey: topLevelSegment || "section",
      groupLabel: humanizeSegment(topLevelSegment || "section"),
    };
  }

  const itemPath = arrayItemMatch[1];
  const collectionSegment = itemPath.split("[")[0] ?? itemPath;
  const revisionItem = getValueAtPath(revisionSection, itemPath);
  const currentItem = getValueAtPath(currentSection, itemPath);
  const itemLabel = getObjectDisplayLabel(revisionItem) ?? getObjectDisplayLabel(currentItem);

  return {
    groupKey: itemPath,
    groupLabel: itemLabel
      ? `${humanizeSegment(collectionSegment)} · ${itemLabel}`
      : formatDiffLabel(itemPath),
  };
}

function groupDiffEntries(entries: RevisionDiffEntry[], revisionSection: unknown, currentSection: unknown) {
  const groups = new Map<string, ContentRevisionDetail["groupedDiffEntries"][number]>();

  for (const entry of entries) {
    const groupMeta = getDiffGroupMeta(entry.path, revisionSection, currentSection);
    const existing = groups.get(groupMeta.groupKey);

    if (existing) {
      existing.entries.push(entry);
      existing.totalChanges += 1;
      continue;
    }

    groups.set(groupMeta.groupKey, {
      groupKey: groupMeta.groupKey,
      groupLabel: groupMeta.groupLabel,
      totalChanges: 1,
      entries: [entry],
    });
  }

  return [...groups.values()];
}

function buildDiffEntries(previous: unknown, current: unknown, path = ""): RevisionDiffEntry[] {
  if (JSON.stringify(previous) === JSON.stringify(current)) {
    return [];
  }

  if (previous === undefined) {
    return [{
      path: path || "root",
      label: formatDiffLabel(path || "root"),
      changeType: "added",
      previousValue: "Tomt",
      currentValue: stringifyValue(current),
    }];
  }

  if (current === undefined) {
    return [{
      path: path || "root",
      label: formatDiffLabel(path || "root"),
      changeType: "removed",
      previousValue: stringifyValue(previous),
      currentValue: "Tomt",
    }];
  }

  if (Array.isArray(previous) && Array.isArray(current)) {
    const entries: RevisionDiffEntry[] = [];
    const maxLength = Math.max(previous.length, current.length);

    for (let index = 0; index < maxLength; index += 1) {
      entries.push(...buildDiffEntries(previous[index], current[index], `${path}[${index}]`));
    }

    return entries;
  }

  if (
    previous
    && current
    && typeof previous === "object"
    && typeof current === "object"
    && !Array.isArray(previous)
    && !Array.isArray(current)
  ) {
    const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);
    const entries: RevisionDiffEntry[] = [];

    for (const key of [...keys].sort((left, right) => left.localeCompare(right, "sv-SE"))) {
      const nextPath = path ? `${path}.${key}` : key;
      entries.push(...buildDiffEntries(
        (previous as Record<string, unknown>)[key],
        (current as Record<string, unknown>)[key],
        nextPath,
      ));
    }

    return entries;
  }

  return [{
    path: path || "root",
    label: formatDiffLabel(path || "root"),
    changeType: "changed",
    previousValue: stringifyValue(previous),
    currentValue: stringifyValue(current),
  }];
}

export async function createContentRevisions(previous: SiteContent, next: SiteContent, metadata: {
  changedBy: string;
  sectionKey?: string;
  changeSummary?: string;
}) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();

  const changedKeys = metadata.sectionKey
    ? [metadata.sectionKey]
    : (Object.keys(next) as Array<keyof SiteContent>).filter((key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]));

  for (const key of changedKeys) {
    await pool.query(
      `
        INSERT INTO cms_content_revisions (section_key, site_snapshot_json, section_content_json, changed_by, change_summary)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        key,
        JSON.stringify(next),
        JSON.stringify(next[key as keyof SiteContent]),
        metadata.changedBy,
        metadata.changeSummary ?? null,
      ],
    );
  }

  if (changedKeys.length > 0) {
    logInfo("Skapade CMS-revision(er).", { changedBy: metadata.changedBy, changedKeys });
  }
}

export async function listContentRevisions(sectionKey?: string): Promise<ContentRevision[]> {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<ContentRevisionRow>(
    `
      SELECT id, section_key, changed_by, change_summary, created_at
      FROM cms_content_revisions
      ${sectionKey ? "WHERE section_key = $1" : ""}
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `,
    sectionKey ? [sectionKey] : [],
  );

  return rows.map((row) => ({
    id: row.id,
    sectionKey: row.section_key,
    sectionLabel: getSectionLabel(row.section_key),
    changedBy: row.changed_by,
    changeSummary: row.change_summary,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function restoreContentRevision(id: number) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<{ site_snapshot_json: string; section_key: string }>(
    `
      SELECT site_snapshot_json, section_key
      FROM cms_content_revisions
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = rows[0];

  if (!row) {
    throw new Error("Revisionen hittades inte.");
  }

  const parsed = JSON.parse(row.site_snapshot_json) as unknown;
  assertSiteContent(parsed);
  return parsed;
}

export async function getContentRevisionDetail(id: number): Promise<ContentRevisionDetail> {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<{
    id: number;
    section_key: string;
    changed_by: string;
    change_summary: string | null;
    created_at: string;
    section_content_json: string;
  }>(
    `
      SELECT id, section_key, changed_by, change_summary, created_at, section_content_json
      FROM cms_content_revisions
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = rows[0];

  if (!row) {
    throw new Error("Revisionen hittades inte.");
  }

  const current = await import("@/lib/content-store").then((module) => module.readSiteContent());
  const currentSection = current[row.section_key as keyof SiteContent];
  const revisionSection = JSON.parse(row.section_content_json) as unknown;
  const diffEntries = buildDiffEntries(revisionSection, currentSection).slice(0, 120);
  const groupedDiffEntries = groupDiffEntries(diffEntries, revisionSection, currentSection);
  const diffSummary = diffEntries.reduce(
    (summary, entry) => ({
      totalChanges: summary.totalChanges + 1,
      added: summary.added + (entry.changeType === "added" ? 1 : 0),
      removed: summary.removed + (entry.changeType === "removed" ? 1 : 0),
      changed: summary.changed + (entry.changeType === "changed" ? 1 : 0),
    }),
    { totalChanges: 0, added: 0, removed: 0, changed: 0 },
  );

  return {
    id: row.id,
    sectionKey: row.section_key,
    sectionLabel: getSectionLabel(row.section_key),
    changedBy: row.changed_by,
    changeSummary: row.change_summary,
    createdAt: new Date(row.created_at).toISOString(),
    revisionContent: JSON.stringify(revisionSection, null, 2),
    currentContent: JSON.stringify(currentSection, null, 2),
    diffSummary,
    diffEntries,
    groupedDiffEntries,
  };
}
