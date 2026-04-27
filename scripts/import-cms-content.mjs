import fs from "node:fs/promises";
import path from "node:path";

import {
  buildVerificationReport,
  ensureDirectory,
  getUploadsRoot,
  getValue,
  hasFlag,
  normalizePublicUrl,
  parseArgs,
  publicUrlToFilename,
  readMediaFromDb,
  readPromotionBundle,
  readSiteContentFromDb,
  resolveFileChecks,
  upsertMediaMetadata,
  withCmsClient,
} from "./cms-promotion-lib.mjs";

function printHelp() {
  console.log(`Usage: node scripts/import-cms-content.mjs --input <directory> [options]

Options:
  --mode <replace|merge-sections>   Importläge. Default: merge-sections
  --copy-media-files                Kopiera mediefiler från bundle/media
  --verify-only                     Validera paketet utan att skriva till databasen
  --help                            Visa denna hjälp
`);
}

const options = parseArgs(process.argv.slice(2));

if (hasFlag(options, "help")) {
  printHelp();
  process.exit(0);
}

const inputArgument = getValue(options, "input") ?? options.positionals[0];
if (!inputArgument) {
  printHelp();
  process.exit(1);
}

const importMode = getValue(options, "mode", "merge-sections");
if (!["replace", "merge-sections"].includes(importMode)) {
  throw new Error("Importläge måste vara 'replace' eller 'merge-sections'.");
}

const copyMediaFiles = hasFlag(options, "copy-media-files");
const verifyOnly = hasFlag(options, "verify-only");
const bundleDir = path.resolve(process.cwd(), inputArgument);
const uploadsRoot = getUploadsRoot(process.cwd());
const bundle = await readPromotionBundle(bundleDir);

await withCmsClient(async (client) => {
  if (importMode === "replace" && !bundle.manifest.includesAllSections) {
    throw new Error("Replace-läge kräver ett fullständigt bundle med alla sektioner.");
  }

  const currentContent = await readSiteContentFromDb(client);
  const currentMedia = await readMediaFromDb(client);
  const mergedContent =
    importMode === "replace"
      ? bundle.content
      : {
          ...currentContent,
          ...bundle.content,
        };
  const verificationMedia =
    importMode === "replace"
      ? bundle.media
      : [
          ...currentMedia.filter((asset) => !bundle.media.some((incoming) => incoming.id === asset.id)),
          ...bundle.media,
        ];
  const verification = buildVerificationReport({
    content: mergedContent,
    mediaAssets: verificationMedia,
    uploadsRoot,
    selectedSections: bundle.manifest.sections,
  });
  const missingFilesOnTarget = await resolveFileChecks(verification.fileChecks);
  const bundleFileNames = new Set(bundle.media.map((asset) => publicUrlToFilename(normalizePublicUrl(asset.publicUrl))).filter(Boolean));
  const bundleMissingFiles = [];

  if (copyMediaFiles) {
    for (const fileName of bundleFileNames) {
      const bundleFilePath = path.join(bundle.mediaDir, fileName);
      try {
        await fs.access(bundleFilePath);
      } catch {
        bundleMissingFiles.push(fileName);
      }
    }
  }

  console.log(`Verifiering av ${bundleDir}`);
  console.log(`Sektioner: ${bundle.manifest.sections.join(", ")}`);
  console.log(`Media metadata i paket: ${bundle.media.length}`);
  console.log(`Saknad metadata i paket: ${verification.missingMetadata.length}`);
  console.log(`Saknade mål-filer efter import utan kopiering: ${missingFilesOnTarget.length}`);

  if (copyMediaFiles) {
    console.log(`Saknade filer i bundle/media: ${bundleMissingFiles.length}`);
  }

  if (verification.missingMetadata.length > 0) {
    throw new Error(`Paketet saknar metadata för ${verification.missingMetadata.length} mediareferenser.`);
  }

  if (copyMediaFiles && bundleMissingFiles.length > 0) {
    throw new Error(`Paketet saknar ${bundleMissingFiles.length} mediefiler trots --copy-media-files.`);
  }

  if (verifyOnly) {
    console.log("Verify-only: ingen data skrevs.");
    return;
  }

  if (copyMediaFiles) {
    await ensureDirectory(uploadsRoot);

    for (const fileName of bundleFileNames) {
      const sourcePath = path.join(bundle.mediaDir, fileName);
      const targetPath = path.join(uploadsRoot, fileName);
      await fs.copyFile(sourcePath, targetPath);
    }
  }

  await client.query("BEGIN");

  try {
    await client.query(
      `
        INSERT INTO cms_content (content_key, content_json)
        VALUES ('site', $1)
        ON CONFLICT (content_key) DO UPDATE
        SET content_json = EXCLUDED.content_json,
            updated_at = CURRENT_TIMESTAMP
      `,
      [JSON.stringify(mergedContent)],
    );

    await upsertMediaMetadata(client, bundle.media);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  console.log(`Import klar med läge '${importMode}'.`);
  console.log(`Skrev ${bundle.manifest.sections.length} sektioner till cms_content.`);
  console.log(`Upsertade ${bundle.media.length} mediaobjekt.`);
});
