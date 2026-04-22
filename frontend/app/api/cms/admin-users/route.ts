import { NextResponse } from "next/server";

import { createCmsAdminUser, listCmsAdminUsers } from "@/lib/cms-admin-users";
import { requireCmsAdminManagement } from "@/lib/cms-route-guards";

export async function GET() {
  const auth = await requireCmsAdminManagement();

  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listCmsAdminUsers());
}

export async function POST(request: Request) {
  const auth = await requireCmsAdminManagement();

  if (auth.error) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      displayName?: string;
      password?: string;
      role?: "superadmin" | "editor" | "blog_editor" | "contact_editor";
    };

    await createCmsAdminUser({
      username: body.username ?? "",
      displayName: body.displayName ?? "",
      password: body.password ?? "",
      role: body.role ?? "editor",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte skapa admin-användaren.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
