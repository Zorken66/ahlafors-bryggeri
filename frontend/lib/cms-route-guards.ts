import { NextResponse } from "next/server";

import { getCmsSession } from "@/lib/cms-auth";
import { canAccessSection, canManageAdmins, canRestoreRevisions, type CmsManagedSection } from "@/lib/cms-permissions";

export async function requireCmsSectionAccess(section: CmsManagedSection) {
  const session = await getCmsSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Obehörig." }, { status: 401 }) };
  }

  if (!canAccessSection(session.role, section)) {
    return { error: NextResponse.json({ error: "Saknar behörighet." }, { status: 403 }) };
  }

  return { session };
}

export async function requireCmsAdminManagement() {
  const session = await getCmsSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Obehörig." }, { status: 401 }) };
  }

  if (!canManageAdmins(session.role)) {
    return { error: NextResponse.json({ error: "Saknar behörighet." }, { status: 403 }) };
  }

  return { session };
}

export async function requireCmsRevisionRestore() {
  const session = await getCmsSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Obehörig." }, { status: 401 }) };
  }

  if (!canRestoreRevisions(session.role)) {
    return { error: NextResponse.json({ error: "Saknar behörighet." }, { status: 403 }) };
  }

  return { session };
}

