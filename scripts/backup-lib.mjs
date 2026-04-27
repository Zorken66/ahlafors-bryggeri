import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import { getUploadsRoot } from "./cms-promotion-lib.mjs";

export function createBackupTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function getBackupsRoot(rootDir = process.cwd()) {
  return path.resolve(rootDir, "backups");
}

export async function ensureDirectory(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? ["ignore", "pipe", "inherit"],
      cwd: options.cwd,
      env: options.env,
    });

    let stdout = "";

    if (child.stdout) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} avslutades med kod ${code ?? 1}.`));
    });
  });
}

export async function createPostgresDump({
  outputFile,
  dbUser = process.env.CMS_DB_USER ?? "cms",
  dbName = process.env.CMS_DB_NAME ?? "ahlafors_cms",
}) {
  await ensureDirectory(path.dirname(outputFile));

  const args = [
    "compose",
    "exec",
    "-T",
    "postgres",
    "pg_dump",
    "-U",
    dbUser,
    "-d",
    dbName,
    "-Fc",
  ];

  await new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: ["ignore", "pipe", "inherit"] });
    let settled = false;

    const stream = child.stdout.pipe(fsSync.createWriteStream(outputFile));

    const fail = async (error) => {
      if (settled) {
        return;
      }

      settled = true;
      try {
        await fs.rm(outputFile, { force: true });
      } catch {}
      reject(error);
    };

    child.on("error", fail);
    stream.on("error", fail);
    child.on("close", async (code) => {
      if (settled) {
        return;
      }

      if (code === 0) {
        settled = true;
        resolve();
        return;
      }

      await fail(new Error(`pg_dump avslutades med kod ${code ?? 1}.`));
    });
  });
}

export async function copyUploadsSnapshot({
  rootDir = process.cwd(),
  targetDir,
}) {
  const uploadsRoot = getUploadsRoot(rootDir);
  await ensureDirectory(path.dirname(targetDir));
  await fs.cp(uploadsRoot, targetDir, { recursive: true, force: true });

  return {
    sourceDir: uploadsRoot,
    targetDir,
  };
}

export async function getDirectoryStats(targetDir) {
  let fileCount = 0;
  let totalBytes = 0;

  async function visit(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        const stats = await fs.stat(absolutePath);
        fileCount += 1;
        totalBytes += stats.size;
      }
    }
  }

  await visit(targetDir);

  return {
    fileCount,
    totalBytes,
  };
}

export async function writeJsonFile(targetPath, value) {
  await ensureDirectory(path.dirname(targetPath));
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
