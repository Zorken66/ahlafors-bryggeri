import { NextResponse } from "next/server";

import { listContentRevisions } from "@/lib/content-revisions";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

export async function GET(request: Request) {
  const auth = await requireCmsSectionAccess("revisions");

  if (auth.error) {
    return auth.error;
  }

  const url = new URL(request.url);
  const section = url.searchParams.get("section") ?? undefined;
  return NextResponse.json(await listContentRevisions(section ?? undefined));
}

