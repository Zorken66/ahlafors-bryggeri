import path from "node:path";

import {
  copyUploadsSnapshot,
  createBackupTimestamp,
  createPostgresDump,
  getBackupsRoot,
  getDirectoryStats,
  writeJsonFile,
} from "./backup-lib.mjs";
import { getUploadsRoot } from "./cms-promotion-lib.mjs";

const timestamp = createBackupTimestamp();
const backupDir = path.join(getBackupsRoot(process.cwd()), `cms-backup-${timestamp}`);
const postgresDumpPath = path.join(backupDir, "postgres.dump");
const uploadsSnapshotDir = path.join(backupDir, "uploads");

await createPostgresDump({ outputFile: postgresDumpPath });
await copyUploadsSnapshot({
  rootDir: process.cwd(),
  targetDir: uploadsSnapshotDir,
});

const uploadsStats = await getDirectoryStats(uploadsSnapshotDir);

await writeJsonFile(path.join(backupDir, "manifest.json"), {
  format: "ahlafors-cms-backup",
  version: 1,
  createdAt: new Date().toISOString(),
  database: {
    engine: "postgres",
    databaseName: process.env.CMS_DB_NAME ?? "ahlafors_cms",
    dumpFile: "postgres.dump",
  },
  uploads: {
    sourceDir: getUploadsRoot(process.cwd()),
    snapshotDir: "uploads",
    fileCount: uploadsStats.fileCount,
    totalBytes: uploadsStats.totalBytes,
  },
});

console.log(`CMS-backup skapad: ${backupDir}`);
console.log(`Databasdump: ${postgresDumpPath}`);
console.log(`Uploads-filer: ${uploadsStats.fileCount}`);
