import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { getCmsDbPool } from "@/lib/cms-db";
import type { CmsMediaAsset, CmsMediaIntegrityReport, CmsMediaTaskItem } from "@/lib/cms-media-schema";
import { readSiteContent } from "@/lib/content-store";
import { collectMediaReferences, getMediaUsage } from "@/lib/media-usage";

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

type ImageDimensions = {
  width: number;
  height: number;
};

type LowQualityAssessment = {
  details: string;
  issueLabel: string;
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

function toMediaTaskItem(asset: CmsMediaAsset): CmsMediaTaskItem {
  return {
    id: asset.id,
    displayName: asset.displayName,
    publicUrl: asset.publicUrl,
    altText: asset.altText,
    createdAt: asset.createdAt,
    usageCount: asset.usageCount ?? 0,
  };
}

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readGifDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 10 || (buffer.toString("ascii", 0, 6) !== "GIF87a" && buffer.toString("ascii", 0, 6) !== "GIF89a")) {
    return null;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);

    if (segmentLength < 2 || offset + 2 + segmentLength > buffer.length) {
      return null;
    }

    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);

  if (chunkType === "VP8 ") {
    if (buffer.length < 30) {
      return null;
    }

    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunkType === "VP8L") {
    if (buffer.length < 25) {
      return null;
    }

    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunkType === "VP8X") {
    if (buffer.length < 30) {
      return null;
    }

    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  return null;
}

function getImageDimensions(buffer: Buffer, mimeType: string): ImageDimensions | null {
  switch (mimeType) {
    case "image/png":
      return readPngDimensions(buffer);
    case "image/gif":
      return readGifDimensions(buffer);
    case "image/jpeg":
    case "image/jpg":
      return readJpegDimensions(buffer);
    case "image/webp":
      return readWebpDimensions(buffer);
    default:
      return null;
  }
}

function assessLowQuality(asset: CmsMediaAsset, dimensions: ImageDimensions | null): LowQualityAssessment | null {
  if (!dimensions) {
    return null;
  }

  const { width, height } = dimensions;
  const pixelCount = width * height;

  if (width < 900 || height < 900) {
    return {
      details: `${width} x ${height}px`,
      issueLabel: "Låg upplösning",
    };
  }

  if (pixelCount < 1_200_000) {
    return {
      details: `${width} x ${height}px`,
      issueLabel: "Begränsad detaljnivå",
    };
  }

  if (asset.sizeBytes < 45 * 1024 && asset.mimeType !== "image/svg+xml") {
    return {
      details: `${width} x ${height}px · ${Math.max(1, Math.round(asset.sizeBytes / 1024))} kB`,
      issueLabel: "Mycket hårt komprimerad",
    };
  }

  return null;
}

function normalizePublicUrl(publicUrl: string) {
  return publicUrl.startsWith("/uploads/")
    ? publicUrl.replace("/uploads/", "/media/")
    : publicUrl;
}

function publicUrlToFilename(publicUrl: string) {
  const normalized = normalizePublicUrl(publicUrl);
  return normalized.startsWith("/media/") ? normalized.slice("/media/".length) : null;
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

  if (cwd.includes(`${path.sep}.next${path.sep}standalone${path.sep}frontend`)) {
    return path.resolve(cwd, "..", "..", "..", "public", "uploads");
  }

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
  const content = await readSiteContent();

  return rows.map((row) => {
    const asset = mapMediaRow(row);
    const usage = getMediaUsage(content, asset.publicUrl);

    return {
      ...asset,
      usage,
      usageCount: usage.length,
    };
  });
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
  const { rows: existingRows } = await pool.query<MediaRow>(
    `
      SELECT id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
      FROM cms_media_assets
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  if (existingRows.length === 0) {
    throw new Error("Bilden kunde inte hittas.");
  }

  const existingAsset = mapMediaRow(existingRows[0]);
  const usage = getMediaUsage(await readSiteContent(), normalizePublicUrl(existingAsset.publicUrl));

  if (usage.length > 0) {
    const locations = usage.slice(0, 2).map((entry) => `${entry.sectionLabel}: ${entry.itemLabel}`).join(", ");
    throw new Error(`Bilden används fortfarande i CMS:et (${locations}${usage.length > 2 ? ", ..." : ""}). Ta bort referenserna först.`);
  }

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

export async function getCmsMediaIntegrityReport(): Promise<CmsMediaIntegrityReport> {
  const assets = await listCmsMediaAssets();
  const content = await readSiteContent();
  const references = collectMediaReferences(content);
  const assetByUrl = new Map(assets.map((asset) => [normalizePublicUrl(asset.publicUrl), asset]));
  const brokenReferences: CmsMediaIntegrityReport["brokenReferences"] = [];
  const lowQualityAssetItems: CmsMediaTaskItem[] = [];
  const uploadsRoot = await ensureUploadsRoot();

  for (const reference of references) {
    const asset = assetByUrl.get(normalizePublicUrl(reference.publicUrl));

    if (!asset) {
      brokenReferences.push({
        publicUrl: reference.publicUrl,
        usage: reference.usage,
        reason: "missing_asset",
      });
      continue;
    }

    const filename = publicUrlToFilename(asset.publicUrl);

    if (!filename) {
      continue;
    }

    try {
      await fs.access(path.join(await ensureUploadsRoot(), filename));
    } catch {
      brokenReferences.push({
        publicUrl: reference.publicUrl,
        usage: reference.usage,
        reason: "missing_file",
      });
    }
  }

  for (const asset of assets) {
    const filename = publicUrlToFilename(asset.publicUrl);

    if (!filename) {
      continue;
    }

    try {
      const fileBuffer = await fs.readFile(path.join(uploadsRoot, filename));
      const qualityIssue = assessLowQuality(asset, getImageDimensions(fileBuffer, asset.mimeType));

      if (qualityIssue) {
        lowQualityAssetItems.push({
          ...toMediaTaskItem(asset),
          details: qualityIssue.details,
          issueLabel: qualityIssue.issueLabel,
        });
      }
    } catch {
      continue;
    }
  }

  const usedAssets = assets.filter((asset) => (asset.usageCount ?? 0) > 0).length;
  const unusedAssets = assets.length - usedAssets;
  const assetsMissingAltText = assets.filter((asset) => !(asset.altText ?? "").trim()).length;

  return {
    totalAssets: assets.length,
    usedAssets,
    unusedAssets,
    assetsMissingAltText,
    lowQualityAssets: lowQualityAssetItems.length,
    unusedAssetItems: assets.filter((asset) => (asset.usageCount ?? 0) === 0).slice(0, 6).map(toMediaTaskItem),
    assetsMissingAltTextItems: assets.filter((asset) => !(asset.altText ?? "").trim()).slice(0, 6).map(toMediaTaskItem),
    lowQualityAssetItems: lowQualityAssetItems.slice(0, 6),
    brokenReferenceCount: brokenReferences.length,
    brokenReferences,
  };
}
