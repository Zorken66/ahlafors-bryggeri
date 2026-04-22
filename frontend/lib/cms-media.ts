import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { getCmsDbPool } from "@/lib/cms-db";
import type { CmsMediaAsset } from "@/lib/cms-media-schema";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

type MediaRow = {
  id: string;
  filename: string;
  display_name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  public_url: string;
  alt_text: string | null;
  uploaded_by: string;
  created_at: string;
};

function mapMediaRow(row: MediaRow): CmsMediaAsset {
  const normalizedPublicUrl = row.public_url.startsWith("/uploads/")
    ? row.public_url.replace("/uploads/", "/media/")
    : row.public_url;

  return {
    id: row.id,
    filename: row.filename,
    displayName: row.display_name || path.parse(row.original_name).name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    publicUrl: normalizedPublicUrl,
    altText: row.alt_text,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/avif":
      return ".avif";
    default:
      return "";
  }
}

function sanitizeFileNameSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}

function getDefaultDisplayName(fileName: string) {
  return path.parse(fileName).name;
}

function getUploadsRoot() {
  const cwd = process.cwd();
  const directPublic = path.join(cwd, "public");
  const nestedPublic = path.join(cwd, "frontend", "public");
  const publicRoot = cwd.endsWith(`${path.sep}frontend`) ? directPublic : nestedPublic;
  return path.join(publicRoot, "uploads");
}

async function ensureUploadsRoot() {
  const uploadsRoot = getUploadsRoot();
  await fs.mkdir(uploadsRoot, { recursive: true });
  return uploadsRoot;
}

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Endast bildfiler kan laddas upp.");
  }

  if (file.size <= 0) {
    throw new Error("Filen verkar vara tom.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Bilden är för stor. Maxstorlek är 10 MB.");
  }
}

export async function listCmsMediaAssets() {
  const pool = getCmsDbPool();
  const { rows } = await pool.query<MediaRow>(`
    SELECT id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
    FROM cms_media_assets
    ORDER BY created_at DESC
  `);

  return rows.map(mapMediaRow);
}

export async function createCmsMediaAsset({ file, altText, uploadedBy }: { file: File; altText?: string; uploadedBy: string }) {
  assertImageFile(file);

  const uploadsRoot = await ensureUploadsRoot();
  const extension = path.extname(file.name) || getExtensionFromMimeType(file.type);
  const safeExtension = sanitizeFileNameSegment(extension || ".bin");
  const filename = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}${safeExtension.startsWith(".") ? safeExtension : `.${safeExtension}`}`;
  const outputPath = path.join(uploadsRoot, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(outputPath, buffer);

  const asset: CmsMediaAsset = {
    id: randomUUID(),
    filename,
    displayName: getDefaultDisplayName(file.name),
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    publicUrl: `/media/${filename}`,
    altText: altText?.trim() || null,
    uploadedBy,
    createdAt: new Date().toISOString(),
  };

  const pool = getCmsDbPool();
  await pool.query(
    `
      INSERT INTO cms_media_assets (id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [asset.id, asset.filename, asset.displayName, asset.originalName, asset.mimeType, asset.sizeBytes, asset.publicUrl, asset.altText, asset.uploadedBy, asset.createdAt],
  );

  return asset;
}

export async function updateCmsMediaAsset(id: string, { altText, displayName }: { altText?: string | null; displayName?: string | null }) {
  const pool = getCmsDbPool();
  const { rows } = await pool.query<MediaRow>(
    `
      UPDATE cms_media_assets
      SET alt_text = $2,
          display_name = COALESCE(NULLIF($3, ''), display_name)
      WHERE id = $1
      RETURNING id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
    `,
    [id, altText?.trim() || null, displayName?.trim() || null],
  );

  if (rows.length === 0) {
    throw new Error("Bilden kunde inte hittas.");
  }

  return mapMediaRow(rows[0]);
}

export async function replaceCmsMediaAssetFile(id: string, file: File) {
  assertImageFile(file);

  const pool = getCmsDbPool();
  const { rows } = await pool.query<MediaRow>(
    `
      SELECT id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
      FROM cms_media_assets
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const existing = rows[0];

  if (!existing) {
    throw new Error("Bilden kunde inte hittas.");
  }

  const filePath = path.join(await ensureUploadsRoot(), existing.filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const { rows: updatedRows } = await pool.query<MediaRow>(
    `
      UPDATE cms_media_assets
      SET original_name = $2,
          mime_type = $3,
          size_bytes = $4
      WHERE id = $1
      RETURNING id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
    `,
    [id, file.name, file.type, file.size],
  );

  return mapMediaRow(updatedRows[0]);
}

export async function deleteCmsMediaAsset(id: string) {
  const pool = getCmsDbPool();
  const { rows } = await pool.query<MediaRow>(
    `
      DELETE FROM cms_media_assets
      WHERE id = $1
      RETURNING id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
    `,
    [id],
  );

  if (rows.length === 0) {
    throw new Error("Bilden kunde inte hittas.");
  }

  const asset = mapMediaRow(rows[0]);
  const filePath = path.join(await ensureUploadsRoot(), asset.filename);
  await fs.rm(filePath, { force: true });
  return asset;
}

export async function getCmsMediaAssetByFilename(filename: string) {
  const pool = getCmsDbPool();
  const { rows } = await pool.query<MediaRow>(
    `
      SELECT id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
      FROM cms_media_assets
      WHERE filename = $1
      LIMIT 1
    `,
    [filename],
  );

  return rows[0] ? mapMediaRow(rows[0]) : null;
}

export async function readCmsMediaAssetFile(filename: string) {
  const filePath = path.join(await ensureUploadsRoot(), filename);
  return fs.readFile(filePath);
}
