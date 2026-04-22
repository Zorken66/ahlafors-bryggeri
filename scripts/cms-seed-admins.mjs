import pg from "pg";

import { getAdminUsersFromEnv, getDbConfig } from "./cms-lib.mjs";

const { Client } = pg;

async function main() {
  const users = getAdminUsersFromEnv();
  const connection = new Client(getDbConfig());
  await connection.connect();

  try {
    await connection.query(`
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

    for (const user of users) {
      await connection.query(
        `
          INSERT INTO cms_admin_users (username, display_name, password_hash, role, is_active)
          VALUES ($1, $2, $3, $4, TRUE)
          ON CONFLICT (username) DO UPDATE
          SET
            display_name = EXCLUDED.display_name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
        `,
        [user.username, user.displayName ?? user.username, user.passwordHash, user.role ?? "superadmin"],
      );
    }

    console.log(`Seeded ${users.length} admin user(s) to PostgreSQL.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
