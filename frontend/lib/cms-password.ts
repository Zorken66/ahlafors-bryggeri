import "server-only";

import crypto from "node:crypto";

export function createPasswordHash(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPasswordHash(password: string, passwordHash: string) {
  const [algorithm, salt, expectedHash] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
}
