import fs from "node:fs/promises";
import path from "node:path";

import {
  buildVerificationReport,
  ensureDirectory,
  getUploadsRoot,
  getValue,
  hasFlag,
  parseArgs,
  parseSectionList,
  pickContentSections,
  publicUrlToFilename,
  readMediaFromDb,
  readSiteContentFromDb,
  resolveFileChecks,
  withCmsClient,
} from "./cms-promotion-lib.mjs";

function printHelp() {
  console.log(`Usage: node scripts/export-cms-content.mjs --output <directory> [options]

Options:
  --sections <a,b,c>         Exportera bara utvalda top-level-sektioner
  --include-media-files      Kopiera mediefiler till exportpaketet
  --source <name>            Sätt källa i manifestet
  --help                     Visa denna hjälp
`);
}

const options = parseArgs(process.argv.slice(2));

if (hasFlag(options, "help")) {
  printHelp();
  process.exit(0);
}

const outputArgument = getValue(options, "output") ?? options.positionals[0];
if (!outputArgument) {
  printHelp();
  process.exit(1);
}

const outputDir = path.resolve(process.cwd(), outputArgument);
const sections = parseSectionList(getValue(options, "sections"));
const includeMediaFiles = hasFlag(options, "include-media-files");
const source = getValue(options, "source", process.env.CMS_PROMOTION_SOURCE ?? "unknown");
const uploadsRoot = getUploadsRoot(process.cwd());

await ensureDirectory(outputDir);

await withCmsClient(async (client) => {
  const siteContent = await readSiteContentFromDb(client);
  const selectedContent = pickContentSections(siteContent, sections);
  const allMediaAssets = await readMediaFromDb(client);
  const verification = buildVerificationReport({
    content: selectedContent,
    mediaAssets: allMediaAssets,
    uploadsRoot,
    selectedSections: sections,
  });
  const referencedMediaUrls = new Set(
    verification.fileChecks.map((filePath) => `/media/${path.basename(filePath)}`),
  );
  const exportedMediaAssets = allMediaAssets.filter((asset) => referencedMediaUrls.has(asset.publicUrl));
  const missingFiles = await resolveFileChecks(verification.fileChecks);

  const manifest = {
    format: "ahlafors-cms-promotion",
    version: 1,
    createdAt: new Date().toISOString(),
    source,
    sections,
    includesAllSections: sections.length === Object.keys(siteContent).length,
    includesMediaFiles: includeMediaFiles,
    counts: {
      sections: sections.length,
      mediaAssets: exportedMediaAssets.length,
      referencedMedia: verification.referencedMediaCount,
    },
    verification: {
      missingMetadata: verification.missingMetadata,
      missingFiles: missingFiles.map((filePath) => path.basename(filePath)),
    },
  };

  await fs.writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "content.json"), `${JSON.stringify(selectedContent, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "media.json"), `${JSON.stringify(exportedMediaAssets, null, 2)}\n`, "utf8");

  if (includeMediaFiles) {
    const mediaDir = path.join(outputDir, "media");
    await ensureDirectory(mediaDir);

    for (const asset of exportedMediaAssets) {
      const filename = publicUrlToFilename(asset.publicUrl);
      if (!filename) {
        continue;
      }

      const sourcePath = path.join(uploadsRoot, filename);
      const targetPath = path.join(mediaDir, filename);

      try {
        await fs.copyFile(sourcePath, targetPath);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
          continue;
        }

        throw error;
      }
    }
  }

  console.log(`Export skapad i ${outputDir}`);
  console.log(`Sektioner: ${sections.join(", ")}`);
  console.log(`Media metadata: ${exportedMediaAssets.length}`);
  console.log(`Saknad media-metadata: ${verification.missingMetadata.length}`);
  console.log(`Saknade mediafiler: ${missingFiles.length}`);
});
