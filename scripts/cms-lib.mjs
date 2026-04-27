import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/u);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!key || key in process.env) {
      continue;
    }

    process.env[key] = value;
  }
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFile(path.join(repoRoot, ".env"));
loadEnvFile(path.join(repoRoot, "frontend", ".env.local"));

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
