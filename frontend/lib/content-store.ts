import "server-only";

import { createContentRevisions } from "@/lib/content-revisions";
import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import { assertSiteContent, normalizeSiteContent, type SiteContent } from "@/lib/content-schema";
import { logInfo } from "@/lib/cms-logger";

export async function readSiteContent(): Promise<SiteContent> {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<{ content_json: string }>(
    "SELECT content_json FROM cms_content WHERE content_key = 'site' LIMIT 1",
  );

  if (rows.length === 0) {
    throw new Error("CMS-innehållet saknas i databasen.");
  }

  const parsed = JSON.parse(rows[0].content_json) as SiteContent;
  const normalized = normalizeSiteContent(parsed);
  assertSiteContent(normalized);
  return normalized;
}

export async function writeSiteContent(
  content: SiteContent,
  metadata?: { changedBy?: string; sectionKey?: keyof SiteContent | string; changeSummary?: string },
): Promise<void> {
  const normalized = normalizeSiteContent(content);
  assertSiteContent(normalized);
  const previous = await readSiteContent();
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  await pool.query(
    `
      INSERT INTO cms_content (content_key, content_json)
      VALUES ('site', $1)
      ON CONFLICT (content_key) DO UPDATE
      SET content_json = EXCLUDED.content_json,
          updated_at = CURRENT_TIMESTAMP
    `,
    [JSON.stringify(normalized)],
  );

  if (metadata?.changedBy) {
    await createContentRevisions(previous, normalized, {
      changedBy: metadata.changedBy,
      sectionKey: metadata.sectionKey,
      changeSummary: metadata.changeSummary,
    });
  }

  logInfo("CMS-innehåll sparat.", {
    changedBy: metadata?.changedBy ?? "okänd",
    sectionKey: metadata?.sectionKey ?? "flera",
  });
}
