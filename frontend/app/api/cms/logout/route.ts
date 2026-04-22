import { NextResponse } from "next/server";

import { clearCmsSession } from "@/lib/cms-auth";

export async function POST() {
  await clearCmsSession();
  return NextResponse.json({ ok: true });
}
