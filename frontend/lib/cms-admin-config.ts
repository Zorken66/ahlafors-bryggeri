import "server-only";

import type { CmsRole } from "@/lib/content-schema";
import { createPasswordHash } from "@/lib/cms-password";

export type ConfigCmsAdminUser = {
  username: string;
  passwordHash: string;
  displayName?: string;
  role?: CmsRole;
};

export function getCmsUsers() {
  const raw = process.env.CMS_ADMIN_USERS;

  if (!raw) {
    return [
      {
        username: "admin",
        displayName: "Admin",
        passwordHash: createPasswordHash("changeme", "devsalt123456789"),
        role: "superadmin",
      },
    ] satisfies ConfigCmsAdminUser[];
  }

  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("CMS_ADMIN_USERS måste vara en JSON-array.");
  }

  const users = parsed.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Ogiltigt CMS_ADMIN_USERS-format.");
    }

    const candidate = item as Partial<ConfigCmsAdminUser>;

    if (typeof candidate.username !== "string" || typeof candidate.passwordHash !== "string") {
      throw new Error("Varje admin-användare måste ha username och passwordHash.");
    }

    return {
      username: candidate.username,
      passwordHash: candidate.passwordHash,
      displayName: typeof candidate.displayName === "string" ? candidate.displayName : candidate.username,
      role: candidate.role === "editor" || candidate.role === "blog_editor" || candidate.role === "contact_editor" || candidate.role === "superadmin"
        ? candidate.role
        : "superadmin",
    };
  });

  if (users.length === 0) {
    throw new Error("CMS_ADMIN_USERS får inte vara tom.");
  }

  return users;
}
