import fs from "node:fs/promises";
import path from "node:path";

import { ensureDirectory, getDirectoryStats } from "./backup-lib.mjs";
import { getUploadsRoot } from "./cms-promotion-lib.mjs";

const args = process.argv.slice(2);
const inputPath = args.find((argument) => !argument.startsWith("--"));
const verifyOnly = args.includes("--verify-only");

if (!inputPath) {
  console.error("Usage: npm run uploads:restore -- <backup-dir> [--verify-only]");
  process.exit(1);
}

const absoluteInputPath = path.resolve(process.cwd(), inputPath);
const uploadsSourceDir = path.join(absoluteInputPath, "uploads");
const uploadsTargetDir = getUploadsRoot(process.cwd());

try {
  const sourceStats = await fs.stat(uploadsSourceDir);
  if (!sourceStats.isDirectory()) {
    throw new Error();
  }
} catch {
  console.error(`Backupkatalogen saknar uploads-snapshot: ${uploadsSourceDir}`);
  process.exit(1);
}

const stats = await getDirectoryStats(uploadsSourceDir);

if (verifyOnly) {
  console.log(`Uploads-restore verifierad: ${absoluteInputPath}`);
  console.log(`Målkatalog: ${uploadsTargetDir}`);
  console.log(`Filer att kopiera: ${stats.fileCount}`);
  process.exit(0);
}

await ensureDirectory(path.dirname(uploadsTargetDir));
await fs.cp(uploadsSourceDir, uploadsTargetDir, { recursive: true, force: true });

console.log(`Uploads återställda till: ${uploadsTargetDir}`);
console.log(`Filer kopierade: ${stats.fileCount}`);
