import "server-only";

import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import type { CmsRole } from "@/lib/content-schema";
import { createPasswordHash } from "@/lib/cms-password";

export type CmsAdminListItem = {
  username: string;
  displayName: string;
  role: CmsRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CmsAdminListRow = {
  username: string;
  display_name: string;
  role: CmsRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function listCmsAdminUsers(): Promise<CmsAdminListItem[]> {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const { rows } = await pool.query<CmsAdminListRow>(
    `
      SELECT username, display_name, is_active, created_at, updated_at
      , role
      FROM cms_admin_users
      ORDER BY created_at ASC, username ASC
    `,
  );

  return rows.map((row) => ({
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function createCmsAdminUser(input: {
  username: string;
  displayName: string;
  password: string;
  role: CmsRole;
}) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = input.password.trim();

  if (!username || !displayName || !password) {
    throw new Error("Användarnamn, visningsnamn och lösenord krävs.");
  }

  await pool.query(
    `
      INSERT INTO cms_admin_users (username, display_name, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
    `,
    [username, displayName, createPasswordHash(password), input.role],
  );
}

export async function updateCmsAdminUser(
  username: string,
  input: {
    displayName?: string;
    password?: string;
    isActive?: boolean;
    role?: CmsRole;
  },
) {
  await ensureCmsDatabaseReady();
  const pool = getCmsDbPool();
  const updates: string[] = [];
  const values: Array<string | number | boolean> = [];

  if (typeof input.displayName === "string") {
    const displayName = input.displayName.trim();

    if (!displayName) {
      throw new Error("Visningsnamn får inte vara tomt.");
    }

    updates.push(`display_name = $${values.length + 1}`);
    values.push(displayName);
  }

  if (typeof input.password === "string" && input.password.trim()) {
    updates.push(`password_hash = $${values.length + 1}`);
    values.push(createPasswordHash(input.password.trim()));
  }

  if (typeof input.isActive === "boolean") {
    updates.push(`is_active = $${values.length + 1}`);
    values.push(input.isActive);
  }

  if (typeof input.role === "string") {
    updates.push(`role = $${values.length + 1}`);
    values.push(input.role);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(username);

  await pool.query(
    `
      UPDATE cms_admin_users
      SET ${updates.join(", ")}
      WHERE username = $${values.length}
    `,
    values,
  );

  if (input.isActive === false) {
    await pool.query("DELETE FROM cms_sessions WHERE username = $1", [username]);
  }
}
