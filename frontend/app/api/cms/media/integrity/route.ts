import { NextResponse } from "next/server";

import { getCmsMediaIntegrityReport } from "@/lib/cms-media";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireCmsSectionAccess("media");

  if (auth.error) {
    return auth.error;
  }

  try {
    return NextResponse.json(await getCmsMediaIntegrityReport());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte verifiera mediereferenser.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
