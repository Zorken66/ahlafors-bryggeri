import type { CmsRole, SiteContent } from "@/lib/content-schema";

export type CmsManagedSection =
  | keyof SiteContent
  | "media"
  | "rullerietPosts"
  | "adminUsers"
  | "contactMessages"
  | "revisions"
  | "operations";

const roleSections: Record<CmsRole, CmsManagedSection[]> = {
  superadmin: [
    "site",
    "homepage",
    "about",
    "productsPage",
    "productDetailPage",
    "products",
    "news",
    "servicesPage",
    "services",
    "recipesPage",
    "recipes",
    "rulleriet",
    "contact",
    "media",
    "rullerietPosts",
    "adminUsers",
    "contactMessages",
    "revisions",
    "operations",
  ],
  editor: [
    "site",
    "homepage",
    "about",
    "productsPage",
    "productDetailPage",
    "products",
    "news",
    "servicesPage",
    "services",
    "recipesPage",
    "recipes",
    "rulleriet",
    "contact",
    "media",
    "rullerietPosts",
    "contactMessages",
    "revisions",
  ],
  blog_editor: ["news", "rulleriet", "media", "rullerietPosts", "revisions"],
  contact_editor: ["contact", "media", "contactMessages", "revisions"],
};

export function getAllowedSectionsForRole(role: CmsRole) {
  return roleSections[role];
}

export function canAccessSection(role: CmsRole, section: CmsManagedSection) {
  return roleSections[role].includes(section);
}

export function canManageAdmins(role: CmsRole) {
  return role === "superadmin";
}

export function canRestoreRevisions(role: CmsRole) {
  return role === "superadmin" || role === "editor";
}
