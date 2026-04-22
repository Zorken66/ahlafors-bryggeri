import { NextResponse } from "next/server";

import { getContentRevisionDetail } from "@/lib/content-revisions";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCmsSectionAccess("revisions");

  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    return NextResponse.json(await getContentRevisionDetail(Number(id)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte läsa revisionen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
