import { NextResponse } from "next/server";

import { ensureCmsDatabaseReady, getCmsDbPool } from "@/lib/cms-db";

export async function GET() {
  try {
    await ensureCmsDatabaseReady();
    const startedAt = Date.now();
    await getCmsDbPool().query("SELECT 1");

    return NextResponse.json({
      status: "ok",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Okänt fel",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

