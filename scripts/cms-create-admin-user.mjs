import { createPasswordHash } from "./cms-lib.mjs";

const [, , username, password, roleOrDisplayName, ...displayNameParts] = process.argv;

if (!username || !password) {
  console.error("Usage: npm run cms:create-admin-user -- <username> <password> [role] [display name]");
  process.exit(1);
}

const validRoles = new Set(["superadmin", "editor", "blog_editor", "contact_editor"]);
const hasRole = roleOrDisplayName && validRoles.has(roleOrDisplayName);
const role = hasRole ? roleOrDisplayName : "editor";
const displayName = (hasRole ? displayNameParts : [roleOrDisplayName, ...displayNameParts]).join(" ").trim() || username;

console.log(JSON.stringify({
  username,
  displayName,
  passwordHash: createPasswordHash(password),
  role,
}));
