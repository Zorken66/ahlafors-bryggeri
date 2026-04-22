import mysql from "mysql2/promise";
import pg from "pg";

const { Client: PgClient } = pg;

function getSourceConfig() {
  return {
    host: process.env.SOURCE_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.SOURCE_DB_PORT ?? "3308"),
    user: process.env.SOURCE_DB_USER ?? "cms",
    password: process.env.SOURCE_DB_PASSWORD ?? "cms",
    database: process.env.SOURCE_DB_NAME ?? "ahlafors_cms",
    dateStrings: true,
  };
}

function getTargetConfig() {
  return {
    host: process.env.CMS_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT ?? "5432"),
    user: process.env.CMS_DB_USER ?? "cms",
    password: process.env.CMS_DB_PASSWORD ?? "cms",
    database: process.env.CMS_DB_NAME ?? "ahlafors_cms",
  };
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = ?
      LIMIT 1
    `,
    [tableName],
  );

  return rows.length > 0;
}

async function migrateCmsContent(source, target) {
  const [rows] = await source.query("SELECT content_key, content_json FROM cms_content");

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_content (content_key, content_json)
        VALUES ($1, $2)
        ON CONFLICT (content_key) DO UPDATE
        SET content_json = EXCLUDED.content_json,
            updated_at = CURRENT_TIMESTAMP
      `,
      [row.content_key, row.content_json],
    );
  }

  return rows.length;
}

async function migrateCmsAdminUsers(source, target) {
  const [rows] = await source.query(
    `
      SELECT username, display_name, password_hash, is_active, created_at, updated_at
      FROM cms_admin_users
    `,
  );

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_admin_users (username, display_name, password_hash, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (username) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            password_hash = EXCLUDED.password_hash,
            is_active = EXCLUDED.is_active,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
      `,
      [
        row.username,
        row.display_name,
        row.password_hash,
        row.is_active === 1,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  return rows.length;
}

async function migrateCmsSessions(source, target) {
  const [rows] = await source.query(
    `
      SELECT session_id, username, issued_at, expires_at, ip_address, user_agent, created_at
      FROM cms_sessions
    `,
  );

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_sessions (session_id, username, issued_at, expires_at, ip_address, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (session_id) DO UPDATE
        SET username = EXCLUDED.username,
            issued_at = EXCLUDED.issued_at,
            expires_at = EXCLUDED.expires_at,
            ip_address = EXCLUDED.ip_address,
            user_agent = EXCLUDED.user_agent,
            created_at = EXCLUDED.created_at
      `,
      [
        row.session_id,
        row.username,
        row.issued_at,
        row.expires_at,
        row.ip_address,
        row.user_agent,
        row.created_at,
      ],
    );
  }

  return rows.length;
}

async function migrateCmsLoginAttempts(source, target) {
  const [rows] = await source.query(
    `
      SELECT ip_address, username, failed_count, first_failed_at, blocked_until, updated_at
      FROM cms_login_attempts
    `,
  );

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_login_attempts (ip_address, username, failed_count, first_failed_at, blocked_until, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (ip_address, username) DO UPDATE
        SET failed_count = EXCLUDED.failed_count,
            first_failed_at = EXCLUDED.first_failed_at,
            blocked_until = EXCLUDED.blocked_until,
            updated_at = EXCLUDED.updated_at
      `,
      [
        row.ip_address,
        row.username,
        row.failed_count,
        row.first_failed_at,
        row.blocked_until,
        row.updated_at,
      ],
    );
  }

  return rows.length;
}

async function migrateCmsContactMessages(source, target) {
  const [rows] = await source.query(
    `
      SELECT id, name, email, phone, subject, message, status, ip_address, user_agent, created_at, updated_at
      FROM cms_contact_messages
      ORDER BY id ASC
    `,
  );

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_contact_messages (id, name, email, phone, subject, message, status, ip_address, user_agent, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            subject = EXCLUDED.subject,
            message = EXCLUDED.message,
            status = EXCLUDED.status,
            ip_address = EXCLUDED.ip_address,
            user_agent = EXCLUDED.user_agent,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
      `,
      [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.subject,
        row.message,
        row.status,
        row.ip_address,
        row.user_agent,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  await target.query(
    `
      SELECT setval(
        pg_get_serial_sequence('cms_contact_messages', 'id'),
        COALESCE((SELECT MAX(id) FROM cms_contact_messages), 1),
        true
      )
    `,
  );

  return rows.length;
}

async function migrateCmsContactFormAttempts(source, target) {
  const [rows] = await source.query(
    `
      SELECT ip_address, window_started_at, request_count, blocked_until, updated_at
      FROM cms_contact_form_attempts
    `,
  );

  for (const row of rows) {
    await target.query(
      `
        INSERT INTO cms_contact_form_attempts (ip_address, window_started_at, request_count, blocked_until, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (ip_address) DO UPDATE
        SET window_started_at = EXCLUDED.window_started_at,
            request_count = EXCLUDED.request_count,
            blocked_until = EXCLUDED.blocked_until,
            updated_at = EXCLUDED.updated_at
      `,
      [
        row.ip_address,
        row.window_started_at,
        row.request_count,
        row.blocked_until,
        row.updated_at,
      ],
    );
  }

  return rows.length;
}

async function main() {
  const source = await mysql.createConnection(getSourceConfig());
  const target = new PgClient(getTargetConfig());
  await target.connect();

  try {
    const migrations = [
      ["cms_content", migrateCmsContent],
      ["cms_admin_users", migrateCmsAdminUsers],
      ["cms_sessions", migrateCmsSessions],
      ["cms_login_attempts", migrateCmsLoginAttempts],
      ["cms_contact_messages", migrateCmsContactMessages],
      ["cms_contact_form_attempts", migrateCmsContactFormAttempts],
    ];

    const results = [];

    for (const [tableName, migrate] of migrations) {
      if (!(await tableExists(source, tableName))) {
        results.push(`${tableName}: saknas i källan, hoppades över`);
        continue;
      }

      const count = await migrate(source, target);
      results.push(`${tableName}: ${count} rad(er) migrerade`);
    }

    console.log(results.join("\n"));
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
