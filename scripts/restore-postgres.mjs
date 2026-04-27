import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("Usage: npm run db:restore -- <path-to-dump>");
  process.exit(1);
}

const absoluteInputPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(absoluteInputPath)) {
  console.error(`Backupvägen hittades inte: ${absoluteInputPath}`);
  process.exit(1);
}

let dumpPath = absoluteInputPath;
const inputStats = fs.statSync(absoluteInputPath);

if (inputStats.isDirectory()) {
  const manifestPath = path.join(absoluteInputPath, "manifest.json");
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : null;

  const candidates = [
    manifest?.database?.dumpFile ? path.join(absoluteInputPath, manifest.database.dumpFile) : null,
    path.join(absoluteInputPath, "postgres.dump"),
  ].filter(Boolean);

  dumpPath = candidates.find((candidate) => fs.existsSync(candidate)) ?? "";

  if (!dumpPath) {
    console.error(`Ingen postgres-dump hittades i backupkatalogen: ${absoluteInputPath}`);
    process.exit(1);
  }
}

const args = [
  "compose",
  "exec",
  "-T",
  "postgres",
  "pg_restore",
  "-U",
  process.env.CMS_DB_USER ?? "cms",
  "-d",
  process.env.CMS_DB_NAME ?? "ahlafors_cms",
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
];

const child = spawn("docker", args, { stdio: ["pipe", "inherit", "inherit"] });
fs.createReadStream(dumpPath).pipe(child.stdin);

child.on("close", (code) => {
  process.exit(code ?? 1);
});
