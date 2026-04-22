import "server-only";

import { Pool, types } from "pg";

import rawContent from "@/content/site-content.json";
import { getCmsUsers } from "@/lib/cms-admin-config";
import { createPasswordHash } from "@/lib/cms-password";
import { assertSiteContent, normalizeSiteContent, type SiteContent } from "@/lib/content-schema";

types.setTypeParser(20, (value) => Number(value));

const globalStore = globalThis as typeof globalThis & {
  __cmsDbPool?: Pool;
  __cmsDbReadyPromise?: Promise<void>;
};

function getDbConfig() {
  return {
    host: process.env.CMS_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT ?? "5432"),
    user: process.env.CMS_DB_USER ?? "cms",
    password: process.env.CMS_DB_PASSWORD ?? "cms",
    database: process.env.CMS_DB_NAME ?? "ahlafors_cms",
  };
}

export function getCmsDbPool() {
  if (!globalStore.__cmsDbPool) {
    globalStore.__cmsDbPool = new Pool({
      ...getDbConfig(),
      max: 10,
    });
  }

  return globalStore.__cmsDbPool;
}

async function ensureSchema() {
  const pool = getCmsDbPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_content (
      content_key VARCHAR(64) PRIMARY KEY,
      content_json TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_admin_users (
      username VARCHAR(64) PRIMARY KEY,
      display_name VARCHAR(128) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'superadmin',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query("ALTER TABLE cms_admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'superadmin'");
  await pool.query("UPDATE cms_admin_users SET role = 'superadmin' WHERE role IS NULL OR role = ''");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_sessions (
      session_id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      issued_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      ip_address VARCHAR(128) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_sessions_username ON cms_sessions (username)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_sessions_expires ON cms_sessions (expires_at)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_login_attempts (
      ip_address VARCHAR(128) NOT NULL,
      username VARCHAR(64) NOT NULL,
      failed_count INT NOT NULL DEFAULT 0,
      first_failed_at BIGINT NOT NULL,
      blocked_until BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ip_address, username)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_contact_messages (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(80) NULL,
      subject VARCHAR(190) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'new',
      ip_address VARCHAR(128) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_contact_messages_status ON cms_contact_messages (status)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_contact_messages_created_at ON cms_contact_messages (created_at)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_contact_form_attempts (
      ip_address VARCHAR(128) PRIMARY KEY,
      window_started_at BIGINT NOT NULL,
      request_count INT NOT NULL DEFAULT 0,
      blocked_until BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_content_revisions (
      id BIGSERIAL PRIMARY KEY,
      section_key VARCHAR(64) NOT NULL,
      site_snapshot_json TEXT NOT NULL,
      section_content_json TEXT NOT NULL,
      changed_by VARCHAR(64) NOT NULL,
      change_summary VARCHAR(255) NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_content_revisions_section_key ON cms_content_revisions (section_key)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_content_revisions_created_at ON cms_content_revisions (created_at DESC)");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_media_assets (
      id VARCHAR(64) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL DEFAULT '',
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL,
      size_bytes BIGINT NOT NULL,
      public_url TEXT NOT NULL,
      alt_text VARCHAR(255) NULL,
      uploaded_by VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query("ALTER TABLE cms_media_assets ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) NOT NULL DEFAULT ''");
  await pool.query("UPDATE cms_media_assets SET display_name = COALESCE(NULLIF(display_name, ''), original_name)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_cms_media_assets_created_at ON cms_media_assets (created_at DESC)");
}

async function seedContent() {
  const pool = getCmsDbPool();
  const { rows } = await pool.query<{ content_key: string }>(
    "SELECT content_key FROM cms_content WHERE content_key = 'site' LIMIT 1",
  );

  if (rows.length > 0) {
    return;
  }

  const seed = normalizeSiteContent(structuredClone(rawContent) as unknown as SiteContent);
  assertSiteContent(seed);

  await pool.query(
    "INSERT INTO cms_content (content_key, content_json) VALUES ('site', $1)",
    [JSON.stringify(seed)],
  );
}

async function syncAdminUsers() {
  const pool = getCmsDbPool();
  const users = getCmsUsers();

  for (const user of users) {
    await pool.query(
      `
        INSERT INTO cms_admin_users (username, display_name, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (username) DO UPDATE
        SET role = COALESCE(cms_admin_users.role, EXCLUDED.role)
      `,
      [user.username, user.displayName ?? user.username, user.passwordHash, user.role ?? "superadmin"],
    );
  }
}

export async function ensureCmsDatabaseReady() {
  if (!globalStore.__cmsDbReadyPromise) {
    globalStore.__cmsDbReadyPromise = (async () => {
      await ensureSchema();
      await seedContent();
      await syncAdminUsers();
    })();
  }

  await globalStore.__cmsDbReadyPromise;
}

export function createFallbackAdminHash() {
  return createPasswordHash("changeme", "devsalt123456789");
}
