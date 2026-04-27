import { NextResponse } from "next/server";

import { deleteCmsMediaAsset, replaceCmsMediaAssetFile, updateCmsMediaAsset } from "@/lib/cms-media";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireCmsSectionAccess("media");

  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData().catch(() => {
        throw new Error("Kunde inte läsa uppladdad fil. Försök välja filen igen.");
      });
      const file = formData.get("file");

      if (!(file instanceof File)) {
        throw new Error("Ingen fil skickades med.");
      }

      return NextResponse.json(await replaceCmsMediaAssetFile(id, file));
    }

    const rawBody = await request.text();
    const body = (rawBody ? JSON.parse(rawBody) : {}) as { altText?: string | null; displayName?: string | null };
    const asset = await updateCmsMediaAsset(id, { altText: body.altText, displayName: body.displayName });
    return NextResponse.json(asset);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte uppdatera bilden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireCmsSectionAccess("media");

  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    await deleteCmsMediaAsset(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte ta bort bilden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
