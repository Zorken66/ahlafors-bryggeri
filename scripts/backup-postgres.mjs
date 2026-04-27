import path from "node:path";

import {
  createBackupTimestamp,
  createPostgresDump,
  ensureDirectory,
  getBackupsRoot,
} from "./backup-lib.mjs";

function parseOutputArg(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--output" && argv[index + 1]) {
      return argv[index + 1];
    }

    if (argument.startsWith("--output=")) {
      return argument.slice("--output=".length);
    }
  }

  return null;
}

const requestedOutput = parseOutputArg(process.argv.slice(2));
const outputFile = requestedOutput
  ? path.resolve(process.cwd(), requestedOutput)
  : path.join(getBackupsRoot(process.cwd()), `ahlafors-cms-${createBackupTimestamp()}.dump`);

await ensureDirectory(path.dirname(outputFile));
await createPostgresDump({ outputFile });

console.log(`Backup skapad: ${outputFile}`);
