import fs from "node:fs/promises";
import path from "node:path";

import { Client } from "pg";

import { getDbConfig } from "./cms-lib.mjs";

export const EXPORT_FORMAT_VERSION = 1;
export const DEFAULT_SECTION_KEYS = [
  "site",
  "homepage",
  "about",
  "productsPage",
  "productDetailPage",
  "products",
  "news",
  "services",
  "servicesPage",
  "recipes",
  "recipesPage",
  "rulleriet",
  "contact",
];

export function parseArgs(argv) {
  const options = {
    flags: new Set(),
    values: new Map(),
    positionals: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument.startsWith("--")) {
      options.positionals.push(argument);
      continue;
    }

    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
    const key = rawKey.trim();

    if (!key) {
      continue;
    }

    if (typeof inlineValue === "string") {
      options.values.set(key, inlineValue);
      continue;
    }

    const nextValue = argv[index + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      options.values.set(key, nextValue);
      index += 1;
      continue;
    }

    options.flags.add(key);
  }

  return options;
}

export function hasFlag(options, name) {
  return options.flags.has(name);
}

export function getValue(options, name, fallback = undefined) {
  return options.values.has(name) ? options.values.get(name) : fallback;
}

export function parseSectionList(rawValue) {
  if (!rawValue) {
    return [...DEFAULT_SECTION_KEYS];
  }

  const sections = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const invalidSections = sections.filter((section) => !DEFAULT_SECTION_KEYS.includes(section));
  if (invalidSections.length > 0) {
    throw new Error(`Okända sektioner: ${invalidSections.join(", ")}`);
  }

  if (sections.length === 0) {
    throw new Error("Minst en sektion måste anges.");
  }

  return Array.from(new Set(sections));
}

export function pickContentSections(content, sections) {
  const picked = {};

  for (const section of sections) {
    if (!(section in content)) {
      throw new Error(`Innehållet saknar sektionen '${section}'.`);
    }

    picked[section] = content[section];
  }

  return picked;
}

export function collectMediaUrls(value, bucket = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("/media/") || value.startsWith("/uploads/")) {
      bucket.add(normalizePublicUrl(value));
    }
    return bucket;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMediaUrls(item, bucket);
    }
    return bucket;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      collectMediaUrls(nestedValue, bucket);
    }
  }

  return bucket;
}

export function normalizePublicUrl(publicUrl) {
  return publicUrl.startsWith("/uploads/")
    ? publicUrl.replace("/uploads/", "/media/")
    : publicUrl;
}

export function publicUrlToFilename(publicUrl) {
  const normalized = normalizePublicUrl(publicUrl);
  return normalized.startsWith("/media/") ? normalized.slice("/media/".length) : null;
}

export function getUploadsRoot(rootDir = process.cwd()) {
  if (rootDir.endsWith(`${path.sep}frontend`)) {
    return path.join(rootDir, "public", "uploads");
  }

  return path.join(rootDir, "frontend", "public", "uploads");
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

export async function readPromotionBundle(bundleDir) {
  const manifestPath = path.join(bundleDir, "manifest.json");
  const contentPath = path.join(bundleDir, "content.json");
  const mediaPath = path.join(bundleDir, "media.json");

  if (!(await pathExists(manifestPath))) {
    throw new Error(`manifest.json saknas i ${bundleDir}`);
  }

  if (!(await pathExists(contentPath))) {
    throw new Error(`content.json saknas i ${bundleDir}`);
  }

  if (!(await pathExists(mediaPath))) {
    throw new Error(`media.json saknas i ${bundleDir}`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const content = JSON.parse(await fs.readFile(contentPath, "utf8"));
  const media = JSON.parse(await fs.readFile(mediaPath, "utf8"));

  validateManifest(manifest);

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw new Error("content.json måste innehålla ett objekt.");
  }

  if (!Array.isArray(media)) {
    throw new Error("media.json måste innehålla en array.");
  }

  return {
    manifest,
    content,
    media,
    bundleDir,
    mediaDir: path.join(bundleDir, "media"),
  };
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("manifest.json måste innehålla ett objekt.");
  }

  if (manifest.format !== "ahlafors-cms-promotion") {
    throw new Error("Okänt manifestformat.");
  }

  if (manifest.version !== EXPORT_FORMAT_VERSION) {
    throw new Error(`Stöder bara manifestversion ${EXPORT_FORMAT_VERSION}.`);
  }

  if (!Array.isArray(manifest.sections) || manifest.sections.length === 0) {
    throw new Error("Manifestet måste innehålla minst en sektion.");
  }
}

export async function withCmsClient(callback) {
  const client = new Client(getDbConfig());
  await client.connect();

  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

export async function readSiteContentFromDb(client) {
  const { rows } = await client.query(
    "SELECT content_json FROM cms_content WHERE content_key = 'site' LIMIT 1",
  );

  if (rows.length === 0) {
    throw new Error("cms_content för 'site' saknas i databasen.");
  }

  return JSON.parse(rows[0].content_json);
}

export async function readMediaFromDb(client) {
  const { rows } = await client.query(`
    SELECT id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
    FROM cms_media_assets
    ORDER BY created_at DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    displayName: row.display_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    publicUrl: normalizePublicUrl(row.public_url),
    altText: row.alt_text,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));
}

export function buildVerificationReport({ content, mediaAssets, uploadsRoot, selectedSections }) {
  const referencedMedia = Array.from(collectMediaUrls(content));
  const mediaByUrl = new Map(mediaAssets.map((asset) => [normalizePublicUrl(asset.publicUrl), asset]));
  const missingMetadata = [];
  const fileChecks = [];

  for (const publicUrl of referencedMedia) {
    const asset = mediaByUrl.get(publicUrl);

    if (!asset) {
      missingMetadata.push(publicUrl);
      continue;
    }

    const filename = publicUrlToFilename(asset.publicUrl);
    if (!filename) {
      fileChecks.push(publicUrl);
      continue;
    }

    const filePath = path.join(uploadsRoot, filename);
    fileChecks.push(filePath);
  }

  return {
    selectedSections,
    referencedMediaCount: referencedMedia.length,
    mediaMetadataCount: mediaAssets.length,
    missingMetadata,
    fileChecks,
  };
}

export async function resolveFileChecks(fileChecks) {
  const missingFiles = [];

  for (const filePath of fileChecks) {
    if (!(await pathExists(filePath))) {
      missingFiles.push(filePath);
    }
  }

  return missingFiles;
}

export async function upsertMediaMetadata(client, mediaAssets) {
  for (const asset of mediaAssets) {
    await client.query(
      `
        INSERT INTO cms_media_assets (
          id,
          filename,
          display_name,
          original_name,
          mime_type,
          size_bytes,
          public_url,
          alt_text,
          uploaded_by,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE
        SET filename = EXCLUDED.filename,
            display_name = EXCLUDED.display_name,
            original_name = EXCLUDED.original_name,
            mime_type = EXCLUDED.mime_type,
            size_bytes = EXCLUDED.size_bytes,
            public_url = EXCLUDED.public_url,
            alt_text = EXCLUDED.alt_text,
            uploaded_by = EXCLUDED.uploaded_by,
            created_at = EXCLUDED.created_at
      `,
      [
        asset.id,
        asset.filename,
        asset.displayName,
        asset.originalName,
        asset.mimeType,
        asset.sizeBytes,
        normalizePublicUrl(asset.publicUrl),
        asset.altText,
        asset.uploadedBy,
        asset.createdAt,
      ],
    );
  }
}
