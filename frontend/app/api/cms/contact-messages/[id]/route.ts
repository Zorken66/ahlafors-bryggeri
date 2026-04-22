import { NextResponse } from "next/server";

import { updateContactMessageStatus } from "@/lib/contact-form";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireCmsSectionAccess("contactMessages");

  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: "new" | "read" | "archived" };
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Ogiltigt meddelande-ID." }, { status: 400 });
    }

    await updateContactMessageStatus(numericId, body.status ?? "new");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte uppdatera meddelandet.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
