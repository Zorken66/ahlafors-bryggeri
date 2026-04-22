import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const outputDir = path.resolve(process.cwd(), "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputFile = path.join(outputDir, `ahlafors-cms-${timestamp}.dump`);

fs.mkdirSync(outputDir, { recursive: true });

const args = [
  "compose",
  "exec",
  "-T",
  "postgres",
  "pg_dump",
  "-U",
  process.env.CMS_DB_USER ?? "cms",
  "-d",
  process.env.CMS_DB_NAME ?? "ahlafors_cms",
  "-Fc",
];

const child = spawn("docker", args, { stdio: ["ignore", "pipe", "inherit"] });
const file = fs.createWriteStream(outputFile);

child.stdout.pipe(file);

child.on("close", (code) => {
  if (code === 0) {
    console.log(`Backup skapad: ${outputFile}`);
    return;
  }

  fs.existsSync(outputFile) && fs.unlinkSync(outputFile);
  process.exit(code ?? 1);
});

