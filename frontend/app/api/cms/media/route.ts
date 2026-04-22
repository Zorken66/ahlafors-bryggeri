import { NextResponse } from "next/server";

import { createCmsMediaAsset, listCmsMediaAssets } from "@/lib/cms-media";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireCmsSectionAccess("media");

  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listCmsMediaAssets());
}

export async function POST(request: Request) {
  const auth = await requireCmsSectionAccess("media");

  if (auth.error) {
    return auth.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const altText = formData.get("altText");

    if (!(file instanceof File)) {
      throw new Error("Ingen bildfil skickades med.");
    }

    const asset = await createCmsMediaAsset({
      file,
      altText: typeof altText === "string" ? altText : undefined,
      uploadedBy: auth.session.username,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte ladda upp bilden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
