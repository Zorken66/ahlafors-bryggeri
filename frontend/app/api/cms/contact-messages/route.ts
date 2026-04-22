import { NextResponse } from "next/server";

import { listContactMessages } from "@/lib/contact-form";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

export async function GET() {
  const auth = await requireCmsSectionAccess("contactMessages");

  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listContactMessages());
}
