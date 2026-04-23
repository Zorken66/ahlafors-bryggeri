import fs from "fs/promises";
import path from "path";
import http from "http";
import crypto from "crypto";
import { fileURLToPath } from "url";

import pg from "pg";

const OLD_HOST = "ahlaforsbryggerier.se";
const OLD_IP = "185.15.121.100";
const OLD_PREFIX = "https://www.ahlaforsbryggerier.se/wp-content/uploads/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const siteContentPath = path.join(repoRoot, "frontend", "content", "site-content.json");
const uploadsRoot = path.join(repoRoot, "frontend", "public", "uploads");

function getDbConfig() {
  return {
    host: process.env.CMS_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT ?? "5432"),
    user: process.env.CMS_DB_USER ?? "cms",
    password: process.env.CMS_DB_PASSWORD ?? "cms",
    database: process.env.CMS_DB_NAME ?? "ahlafors_cms",
  };
}

function toMediaUrl(remoteUrl) {
  const url = new URL(remoteUrl);
  const baseName = path.basename(url.pathname);
  return `/media/product-${baseName}`;
}

function toLocalFilePath(remoteUrl) {
  return path.join(uploadsRoot, path.basename(toMediaUrl(remoteUrl)));
}

function shouldMigrateUrl(value) {
  return typeof value === "string" && value.startsWith(OLD_PREFIX);
}

function shouldPromoteUploadUrl(value) {
  return typeof value === "string" && value.startsWith("/uploads/product-");
}

async function downloadFromLegacyHost(remoteUrl, targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  try {
    await fs.access(targetPath);
    return;
  } catch {
    // continue
  }

  const sourceUrl = new URL(remoteUrl);

  await new Promise((resolve, reject) => {
    const request = http.get(
      {
        host: OLD_IP,
        port: 80,
        path: `${sourceUrl.pathname}${sourceUrl.search}`,
        headers: {
          Host: sourceUrl.hostname.replace(/^www\./, ""),
        },
      },
      (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          downloadFromLegacyHost(response.headers.location, targetPath).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Download failed for ${remoteUrl}: HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", async () => {
          try {
            await fs.writeFile(targetPath, Buffer.concat(chunks));
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on("error", reject);
  });
}

async function rewriteProducts(content) {
  let changed = 0;

  const nextProducts = await Promise.all(
    content.products.map(async (product) => {
      let nextProduct = { ...product };

      if (shouldMigrateUrl(product.image)) {
        const nextImage = toMediaUrl(product.image);
        await downloadFromLegacyHost(product.image, toLocalFilePath(product.image));
        nextProduct.image = nextImage;
        changed += 1;
      } else if (shouldPromoteUploadUrl(product.image)) {
        nextProduct.image = product.image.replace("/uploads/", "/media/");
        changed += 1;
      }

      if (shouldMigrateUrl(product.ogImage)) {
        const nextOgImage = toMediaUrl(product.ogImage);
        await downloadFromLegacyHost(product.ogImage, toLocalFilePath(product.ogImage));
        nextProduct.ogImage = nextOgImage;
        changed += 1;
      } else if (shouldPromoteUploadUrl(product.ogImage)) {
        nextProduct.ogImage = product.ogImage.replace("/uploads/", "/media/");
        changed += 1;
      }

      return nextProduct;
    }),
  );

  return {
    content: {
      ...content,
      products: nextProducts,
    },
    changed,
  };
}

function getMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".webp":
      return "image/webp";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

async function ensureMediaAsset(pool, filePath) {
  const filename = path.basename(filePath);
  const existing = await pool.query(
    "select id from cms_media_assets where filename = $1 limit 1",
    [filename],
  );

  if (existing.rows.length > 0) {
    await pool.query(
      "update cms_media_assets set public_url = $2 where filename = $1 and public_url <> $2",
      [filename, `/media/${filename}`],
    );
    return;
  }

  const stats = await fs.stat(filePath);
  await pool.query(
    `
      insert into cms_media_assets (
        id, filename, display_name, original_name, mime_type, size_bytes, public_url, alt_text, uploaded_by, created_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      crypto.randomUUID(),
      filename,
      path.parse(filename).name,
      filename,
      getMimeType(filename),
      stats.size,
      `/media/${filename}`,
      null,
      "system-import",
      new Date().toISOString(),
    ],
  );
}

async function main() {
  const rawSiteContent = await fs.readFile(siteContentPath, "utf8");
  const siteContent = JSON.parse(rawSiteContent);
  const siteResult = await rewriteProducts(siteContent);
  await fs.writeFile(siteContentPath, `${JSON.stringify(siteResult.content, null, 2)}\n`);

  const pool = new pg.Pool(getDbConfig());
  try {
    const result = await pool.query("select content_json from cms_content where content_key = 'site' limit 1");
    const dbContent = JSON.parse(result.rows[0].content_json);
    const dbResult = await rewriteProducts(dbContent);
    const productImages = new Set(
      dbResult.content.products.flatMap((product) => [product.image, product.ogImage].filter(Boolean)),
    );

    for (const mediaUrl of productImages) {
      if (typeof mediaUrl !== "string" || !mediaUrl.startsWith("/media/")) {
        continue;
      }

      await ensureMediaAsset(pool, path.join(uploadsRoot, path.basename(mediaUrl)));
    }

    await pool.query(
      "update cms_content set content_json = $1, updated_at = current_timestamp where content_key = 'site'",
      [JSON.stringify(dbResult.content)],
    );
    console.log(`Migrated ${dbResult.changed} product image references in database.`);
  } finally {
    await pool.end();
  }

  console.log(`Updated site-content.json and ensured files under ${uploadsRoot}.`);
}

await main();
