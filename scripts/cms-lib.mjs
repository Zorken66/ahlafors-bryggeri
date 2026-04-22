import crypto from "node:crypto";

export function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function getDbConfig() {
  return {
    host: process.env.CMS_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT ?? "5432"),
    user: process.env.CMS_DB_USER ?? "cms",
    password: process.env.CMS_DB_PASSWORD ?? "cms",
    database: process.env.CMS_DB_NAME ?? "ahlafors_cms",
  };
}

export function getAdminUsersFromEnv() {
  const raw = process.env.CMS_ADMIN_USERS;

  if (!raw) {
    throw new Error("CMS_ADMIN_USERS saknas i miljön.");
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("CMS_ADMIN_USERS måste vara en icke-tom JSON-array.");
  }

  for (const user of parsed) {
    if (!user || typeof user !== "object" || typeof user.username !== "string" || typeof user.passwordHash !== "string") {
      throw new Error("Varje admin i CMS_ADMIN_USERS måste ha username och passwordHash.");
    }
  }

  return parsed;
}
