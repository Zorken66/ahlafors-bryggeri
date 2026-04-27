import { NextResponse } from "next/server";

import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";
import { getCmsMediaIntegrityReport } from "@/lib/cms-media";

export async function GET() {
  try {
    await ensureCmsDatabaseReady();
    await getCmsDbPool().query("SELECT 1");
    const media = await getCmsMediaIntegrityReport();

    return NextResponse.json({
      status: "ok",
      database: "ok",
      media: {
        status: media.brokenReferenceCount > 0 ? "degraded" : "ok",
        brokenReferences: media.brokenReferenceCount,
        assetsMissingAltText: media.assetsMissingAltText,
        unusedAssets: media.unusedAssets,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      database: "error",
      message: error instanceof Error ? error.message : "Okänt fel",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
