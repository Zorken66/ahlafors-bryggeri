import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { Client } from "pg";

const ROOT = process.cwd();
const SITE_CONTENT_PATH = path.join(ROOT, "frontend", "content", "site-content.json");
const SITEMAP_URL = "https://www.ahlaforsbryggerier.se/produkt-sitemap.xml";
const SITE_SUFFIX = " - Ahlafors Bryggerier";

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ouml;/g, "ö")
    .replace(/&auml;/g, "ä")
    .replace(/&aring;/g, "å")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Aring;/g, "Å")
    .replace(/&#038;/g, "&")
    .replace(/\u00a0/g, " ");
}

function stripTags(value) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function comparableKey(value) {
  return slugify(value).replace(/-/g, "");
}

function extractMeta(html, property) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
  return pattern.exec(html)?.[1]?.trim() ?? "";
}

function extractMatch(html, pattern) {
  const match = pattern.exec(html);
  return match?.[1]?.trim() ?? "";
}

function normalizeAlcohol(value) {
  return value.replace(/\s+/g, "").replace(",", ".");
}

function normalizeArticleNumber(value) {
  return value.replace(/\s+/g, "").replace(/[^\d-]/g, "");
}

function categoryFromType(type) {
  const normalized = slugify(type);
  if (normalized.includes("ipa")) {
    return "ipa";
  }
  if (normalized.includes("cider")) {
    return "cider";
  }
  if (normalized.includes("porter")) {
    return "porter";
  }
  if (normalized.includes("stout")) {
    return "stout";
  }
  if (normalized.includes("lager")) {
    return "lager";
  }
  return "ale";
}

function inferStyle(name, type, slug) {
  const normalizedSlug = slugify(slug);
  const normalizedName = slugify(name);

  if (normalizedName.includes("american-pale-ale") || normalizedSlug.includes("american-pale-ale")) return "American Pale Ale";
  if (normalizedName.includes("marzen") || normalizedSlug.includes("marzen")) return "Märzen";
  if (normalizedName.includes("heritage") || normalizedSlug.includes("heritage")) return "Extra Special Bitter";
  if (normalizedName.includes("britt") || normalizedSlug.includes("britt")) return "English Bitter";
  if (normalizedName.includes("imperator") || normalizedSlug.includes("imperator")) return "Imperial Stout";
  if (normalizedName.includes("fortis-aurum") || normalizedSlug.includes("fortis-aurum")) return "Belgisk Tripel";
  if (normalizedName.includes("into-the-deep") || normalizedSlug.includes("into-the-deep")) return "Dubbel IPA";
  if (normalizedName.includes("pale-ale") || normalizedSlug.includes("pale-ale")) return "Pale Ale";
  if (normalizedName.includes("oberoende") || normalizedSlug.includes("oberoende")) return "American Pale Ale";
  if (normalizedName.includes("jubileums-ipa") || normalizedSlug.includes("jubileums-ipa")) return "IPA";
  if (normalizedName.includes("ipa") || normalizedSlug.includes("ipa")) return "IPA";
  if (normalizedName.includes("haze") || normalizedSlug.includes("haze")) return "Hazy IPA";
  if (normalizedName.includes("skagerrak") || normalizedSlug.includes("skagerrak")) return "Pilsner";
  if (normalizedName.includes("artisan") || normalizedSlug.includes("artisan")) return "Lager";
  if (normalizedName.includes("ljus-lager") || normalizedSlug.includes("ljus-lager")) return "Ljus Lager";
  if (normalizedName.includes("ljusa") || normalizedSlug.includes("ljusa")) return "Ljus Lager";
  if (normalizedName.includes("el-dorado") || normalizedSlug.includes("el-dorado")) return "Lager";
  if (normalizedName.includes("lager") || normalizedSlug.includes("lager")) return "Lager";
  if (normalizedName.includes("julol") || normalizedSlug.includes("julol")) return "Julöl";
  if (normalizedName.includes("ginger") || normalizedSlug.includes("ginger")) return "Ciderkaraktär med ingefära";
  if (normalizedName.includes("flader") || normalizedSlug.includes("flader")) return "Cider";
  if (normalizedName.includes("lingon") || normalizedSlug.includes("lingon")) return "Cider";
  if (normalizedName.includes("peach-passion") || normalizedSlug.includes("peach-passion")) return "Cider";

  return type;
}

function splitParagraphs(html) {
  const textBlock = extractMatch(html, /<div class="produkt-single-text">([\s\S]*?)<\/div>\s*<\/div>/i);
  if (!textBlock) {
    return [];
  }

  const matches = [...textBlock.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  return matches
    .map(([, paragraph]) => stripTags(paragraph))
    .filter(Boolean)
    .filter((paragraph) => !/^Hitta på Systembolaget/i.test(paragraph))
    .filter((paragraph) => !/^Artikelnummer på Systembolaget:/i.test(paragraph));
}

function cleanSeoDescription(value) {
  return decodeHtml(value)
    .replace(/\s*Läs mer\.\s*$/i, "")
    .replace(/\s*Hitta på Systembolaget\s*→?\s*$/i, "")
    .trim();
}

function buildImportedProduct(page, existing) {
  const type = page.type;
  const style = inferStyle(page.name, type, page.slug);

  return {
    id: existing?.id ?? page.slug,
    name: page.name,
    slug: page.slug,
    type,
    description: page.seoDescription || page.paragraphs[0] || "",
    fullDescription: page.paragraphs.join("\n\n") || page.seoDescription || "",
    style,
    alcohol: normalizeAlcohol(page.alcohol),
    volume: page.volume,
    systembolaget: page.systembolaget,
    artikelnummer: page.artikelnummer,
    image: page.image,
    category: categoryFromType(type),
    featured: existing?.featured ?? false,
    published: existing?.published ?? true,
    publishedAt: existing?.publishedAt ?? page.publishedAt,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    links: page.systembolaget
      ? [{ label: "Systembolaget", url: page.systembolaget }]
      : (existing?.links ?? []),
    ogImage: page.ogImage || page.image,
    relatedProductIds: existing?.relatedProductIds ?? [],
  };
}

function findExistingProduct(existingProducts, page) {
  const article = normalizeArticleNumber(page.artikelnummer);
  const pageSlugKey = comparableKey(page.slug);
  const pageNameKey = comparableKey(page.name);

  return existingProducts.find((product) => {
    const productArticle = normalizeArticleNumber(product.artikelnummer ?? "");
    const productSlugKey = comparableKey(product.slug || product.name || "");
    const productNameKey = comparableKey(product.name || "");

    if (article && productArticle && article === productArticle) {
      return true;
    }

    if (pageSlugKey && productSlugKey && pageSlugKey === productSlugKey) {
      return true;
    }

    if (pageNameKey && productNameKey && pageNameKey === productNameKey) {
      return true;
    }

    return false;
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; AhlaforsImporter/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunde inte hämta ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchSitemapPages() {
  const xml = await fetchText(SITEMAP_URL);
  const matches = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)];

  return matches
    .map(([, loc, lastmod]) => ({ loc, lastmod }))
    .filter((entry) => entry.loc !== "https://www.ahlaforsbryggerier.se/produkter/");
}

async function parseProductPage({ loc, lastmod }) {
  const html = await fetchText(loc);
  const pageTitle = stripTags(extractMatch(html, /<title>([\s\S]*?)<\/title>/i));
  const name = stripTags(extractMatch(html, /<h1 class="produkt-single-title">\s*([\s\S]*?)\s*<\/h1>/i));
  const type = stripTags(extractMatch(html, /<img[^>]+alt="Typ"[^>]*>\s*([^<]+)</i));
  const alcohol = stripTags(extractMatch(html, /<img[^>]+alt="Volymprocent"[^>]*>\s*([^<]+)</i));
  const volume = stripTags(extractMatch(html, /<img[^>]+alt="Innehåll i centiliter"[^>]*>\s*([^<]+)</i));
  const image = extractMatch(html, /<div class="col-sm-6 produkt-single-image">[\s\S]*?<img[^>]+src="([^"]+)"/i);
  const systembolaget = extractMatch(html, /<a[^>]+href="([^"]+)"[^>]*>\s*Hitta på Systembolaget/i);
  const artikelnummer = normalizeArticleNumber(stripTags(extractMatch(html, /Artikelnummer på Systembolaget:\s*<strong>([\s\S]*?)<\/strong>/i)));
  const ogImage = extractMeta(html, "og:image");
  const seoDescription = cleanSeoDescription(extractMeta(html, "og:description"));
  const seoTitle = pageTitle.endsWith(SITE_SUFFIX) ? pageTitle.slice(0, -SITE_SUFFIX.length).trim() : pageTitle;
  const slug = new URL(loc).pathname.split("/").filter(Boolean).at(-1) ?? slugify(name);
  const paragraphs = splitParagraphs(html);

  return {
    slug,
    name,
    type,
    alcohol,
    volume,
    image: image || ogImage,
    systembolaget,
    artikelnummer,
    ogImage,
    seoTitle,
    seoDescription,
    paragraphs,
    publishedAt: lastmod.slice(0, 10),
  };
}

async function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  const envContent = await readFile(envPath, "utf8");

  for (const line of envContent.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function writeDatabase(content) {
  await loadEnv();

  const client = new Client({
    host: process.env.CMS_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.CMS_DB_PORT ?? "5432"),
    user: process.env.CMS_DB_USER ?? "cms",
    password: process.env.CMS_DB_PASSWORD ?? "cms",
    database: process.env.CMS_DB_NAME ?? "ahlafors_cms",
  });

  await client.connect();

  try {
    await client.query(
      `
        INSERT INTO cms_content (content_key, content_json)
        VALUES ('site', $1)
        ON CONFLICT (content_key) DO UPDATE
        SET content_json = EXCLUDED.content_json,
            updated_at = CURRENT_TIMESTAMP
      `,
      [JSON.stringify(content)],
    );
  } finally {
    await client.end();
  }
}

async function main() {
  const currentContent = JSON.parse(await readFile(SITE_CONTENT_PATH, "utf8"));
  const sitemapPages = await fetchSitemapPages();
  const importedPages = await Promise.all(sitemapPages.map(parseProductPage));

  const importedProducts = importedPages.map((page) => {
    const existing = findExistingProduct(currentContent.products, page);
    return buildImportedProduct(page, existing);
  });

  const importedIds = new Set(importedProducts.map((product) => product.id));
  const existingUnmatched = currentContent.products.filter((product) => !importedIds.has(product.id));
  const mergedProducts = [...importedProducts, ...existingUnmatched];

  const dedupedProducts = mergedProducts.filter((product, index, all) => {
    const key = normalizeArticleNumber(product.artikelnummer ?? "")
      || comparableKey(product.slug || product.name || "");

    return all.findIndex((candidate) => {
      const candidateKey = normalizeArticleNumber(candidate.artikelnummer ?? "")
        || comparableKey(candidate.slug || candidate.name || "");
      return candidateKey === key;
    }) === index;
  });

  const nextContent = {
    ...currentContent,
    products: dedupedProducts,
  };

  await writeFile(SITE_CONTENT_PATH, `${JSON.stringify(nextContent, null, 2)}\n`, "utf8");
  await writeDatabase(nextContent);

  console.log(`Importerade ${importedProducts.length} produkter från ahlaforsbryggerier.se.`);
  console.log(`Totalt antal produkter efter deduplicering: ${dedupedProducts.length}.`);
}

await main();
