import "server-only";

import crypto from "node:crypto";

import { cookies } from "next/headers";

import { getCmsUsers as getConfiguredCmsUsers } from "@/lib/cms-admin-config";
import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import type { CmsRole } from "@/lib/content-schema";
import { verifyPasswordHash } from "@/lib/cms-password";

const SESSION_COOKIE = "cms_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export type CmsAdminUser = {
  username: string;
  passwordHash: string;
  displayName?: string;
  role: CmsRole;
};

type CmsSessionToken = {
  sessionId: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
};

export type CmsSession = CmsSessionToken & {
  displayName: string;
  role: CmsRole;
};

type CmsAdminUserRow = {
  username: string;
  display_name: string;
  password_hash: string;
  is_active: boolean;
  role: CmsRole;
};

function getSecret() {
  return process.env.CMS_SESSION_SECRET ?? "local-dev-secret";
}

function shouldUseSecureCookies() {
  return process.env.CMS_COOKIE_SECURE === "true";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodeSession(session: CmsSessionToken) {
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

function decodeSession(cookieValue: string): CmsSessionToken | null {
  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<CmsSessionToken>;

    if (
      typeof parsed.sessionId !== "string"
      || typeof parsed.username !== "string"
      || typeof parsed.issuedAt !== "number"
      || typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return parsed as CmsSessionToken;
  } catch {
    return null;
  }
}

export function getCmsUsers() {
  return getConfiguredCmsUsers();
}

export async function getCmsUser(username: string) {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<CmsAdminUserRow>(
    `
      SELECT username, display_name, password_hash, is_active, role
      FROM cms_admin_users
      WHERE LOWER(username) = $1
      LIMIT 1
    `,
    [normalizedUsername],
  );

  const row = rows[0];

  if (!row || row.is_active !== true) {
    return null;
  }

  return {
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    role: row.role,
  };
}

export async function verifyCmsCredentials(username: string, password: string) {
  const user = await getCmsUser(username);

  if (!user) {
    return null;
  }

  return verifyPasswordHash(password, user.passwordHash) ? user : null;
}

export async function getCmsSession() {
  await ensureCmsDatabaseReady();
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  const session = decodeSession(cookieValue);

  if (!session) {
    return null;
  }

  const pool = getCmsDbPool();
  const { rows } = await pool.query<{ session_id: string; display_name: string; role: CmsRole }>(
    `
      SELECT s.session_id, u.display_name, u.role
      FROM cms_sessions s
      INNER JOIN cms_admin_users u ON u.username = s.username
      WHERE s.session_id = $1 AND s.username = $2 AND s.expires_at > $3 AND u.is_active = TRUE
      LIMIT 1
    `,
    [session.sessionId, session.username, Date.now()],
  );

  return rows.length > 0
    ? {
      ...session,
      displayName: rows[0].display_name,
      role: rows[0].role,
    }
    : null;
}

export async function isCmsAuthenticated() {
  return Boolean(await getCmsSession());
}

export async function createCmsSession(username: string, metadata?: { ipAddress?: string; userAgent?: string | null }) {
  await ensureCmsDatabaseReady();
  const cookieStore = await cookies();
  const now = Date.now();
  const session: CmsSessionToken = {
    sessionId: crypto.randomUUID(),
    username,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const pool = getCmsDbPool();
  await pool.query(
    `
      INSERT INTO cms_sessions (session_id, username, issued_at, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      session.sessionId,
      session.username,
      session.issuedAt,
      session.expiresAt,
      metadata?.ipAddress ?? null,
      metadata?.userAgent ?? null,
    ],
  );

  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  return session;
}

export async function clearCmsSession() {
  await ensureCmsDatabaseReady();
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (cookieValue) {
    const session = decodeSession(cookieValue);

    if (session) {
      const pool = getCmsDbPool();
      await pool.query("DELETE FROM cms_sessions WHERE session_id = $1", [session.sessionId]);
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}
