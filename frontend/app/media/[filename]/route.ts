import { NextResponse } from "next/server";

import { getCmsMediaAssetByFilename, readCmsMediaAssetFile } from "@/lib/cms-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await context.params;
    const asset = await getCmsMediaAssetByFilename(filename);

    if (!asset) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const buffer = await readCmsMediaAssetFile(filename);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${asset.originalName.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
