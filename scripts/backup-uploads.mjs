import path from "node:path";

import {
  copyUploadsSnapshot,
  createBackupTimestamp,
  getBackupsRoot,
  getDirectoryStats,
  writeJsonFile,
} from "./backup-lib.mjs";
import { getUploadsRoot } from "./cms-promotion-lib.mjs";

const timestamp = createBackupTimestamp();
const backupDir = path.join(getBackupsRoot(process.cwd()), `uploads-${timestamp}`);
const uploadsSnapshotDir = path.join(backupDir, "uploads");
const uploadsRoot = getUploadsRoot(process.cwd());

await copyUploadsSnapshot({
  rootDir: process.cwd(),
  targetDir: uploadsSnapshotDir,
});

const stats = await getDirectoryStats(uploadsSnapshotDir);

await writeJsonFile(path.join(backupDir, "manifest.json"), {
  format: "ahlafors-cms-uploads-backup",
  version: 1,
  createdAt: new Date().toISOString(),
  uploads: {
    sourceDir: uploadsRoot,
    snapshotDir: "uploads",
    fileCount: stats.fileCount,
    totalBytes: stats.totalBytes,
  },
});

console.log(`Uploads-backup skapad: ${backupDir}`);
console.log(`Filer: ${stats.fileCount}`);
