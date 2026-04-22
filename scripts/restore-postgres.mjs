import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("Usage: npm run db:restore -- <path-to-dump>");
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(absolutePath)) {
  console.error(`Dumpfilen hittades inte: ${absolutePath}`);
  process.exit(1);
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
fs.createReadStream(absolutePath).pipe(child.stdin);

child.on("close", (code) => {
  process.exit(code ?? 1);
});

