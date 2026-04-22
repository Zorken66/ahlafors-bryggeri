import { NextResponse } from "next/server";

import { updateCmsAdminUser } from "@/lib/cms-admin-users";
import { requireCmsAdminManagement } from "@/lib/cms-route-guards";

type RouteContext = {
  params: Promise<{
    username: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireCmsAdminManagement();

  if (auth.error) {
    return auth.error;
  }

  const { username } = await context.params;

  try {
    const body = (await request.json()) as {
      displayName?: string;
      password?: string;
      isActive?: boolean;
      role?: "superadmin" | "editor" | "blog_editor" | "contact_editor";
    };

    if (auth.session.username === username && body.isActive === false) {
      return NextResponse.json({ error: "Du kan inte stänga av ditt eget konto." }, { status: 400 });
    }

    if (auth.session.username === username && body.role && body.role !== auth.session.role) {
      return NextResponse.json({ error: "Du kan inte ändra din egen roll." }, { status: 400 });
    }

    await updateCmsAdminUser(username, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte uppdatera admin-användaren.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
