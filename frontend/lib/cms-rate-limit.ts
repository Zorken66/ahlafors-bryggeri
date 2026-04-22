import "server-only";

import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";

type AttemptRow = {
  failed_count: number;
  first_failed_at: number;
  blocked_until: number;
};

const WINDOW_MS = 1000 * 60 * 15;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 1000 * 60 * 15;

function normalizeUsername(username: string) {
  return username.toLowerCase();
}

export async function getRemainingBlockMs(ip: string, username: string) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<AttemptRow>(
    `
      SELECT blocked_until
      FROM cms_login_attempts
      WHERE ip_address = $1 AND username = $2
      LIMIT 1
    `,
    [ip, normalizeUsername(username)],
  );

  const blockedUntil = rows[0]?.blocked_until ?? 0;
  return Math.max(0, blockedUntil - Date.now());
}

export async function registerFailedLogin(ip: string, username: string) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const normalizedUsername = normalizeUsername(username);
  const now = Date.now();

  const { rows } = await pool.query<AttemptRow>(
    `
      SELECT failed_count, first_failed_at, blocked_until
      FROM cms_login_attempts
      WHERE ip_address = $1 AND username = $2
      LIMIT 1
    `,
    [ip, normalizedUsername],
  );

  const existing = rows[0];

  if (!existing || now - existing.first_failed_at > WINDOW_MS) {
    await pool.query(
      `
        INSERT INTO cms_login_attempts (ip_address, username, failed_count, first_failed_at, blocked_until)
        VALUES ($1, $2, 1, $3, 0)
        ON CONFLICT (ip_address, username) DO UPDATE
        SET
          failed_count = 1,
          first_failed_at = EXCLUDED.first_failed_at,
          blocked_until = 0,
          updated_at = CURRENT_TIMESTAMP
      `,
      [ip, normalizedUsername, now],
    );
    return;
  }

  const nextCount = existing.failed_count + 1;
  const blockedUntil = nextCount >= MAX_ATTEMPTS ? now + BLOCK_MS : 0;

  await pool.query(
    `
      UPDATE cms_login_attempts
      SET failed_count = $1, blocked_until = $2, updated_at = CURRENT_TIMESTAMP
      WHERE ip_address = $3 AND username = $4
    `,
    [nextCount, blockedUntil, ip, normalizedUsername],
  );
}

export async function clearFailedLogins(ip: string, username: string) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  await pool.query(
    "DELETE FROM cms_login_attempts WHERE ip_address = $1 AND username = $2",
    [ip, normalizeUsername(username)],
  );
}
