import "server-only";

import type { SiteContent } from "@/lib/content-schema";
import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import { assertSiteContent } from "@/lib/content-schema";
import { logInfo } from "@/lib/cms-logger";

export type ContentRevision = {
  id: number;
  sectionKey: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

export type ContentRevisionDetail = ContentRevision & {
  revisionContent: string;
  currentContent: string;
};

type ContentRevisionRow = {
  id: number;
  section_key: string;
  changed_by: string;
  change_summary: string | null;
  created_at: string;
};

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

  return {
    id: row.id,
    sectionKey: row.section_key,
    changedBy: row.changed_by,
    changeSummary: row.change_summary,
    createdAt: new Date(row.created_at).toISOString(),
    revisionContent: JSON.stringify(JSON.parse(row.section_content_json), null, 2),
    currentContent: JSON.stringify(currentSection, null, 2),
  };
}
