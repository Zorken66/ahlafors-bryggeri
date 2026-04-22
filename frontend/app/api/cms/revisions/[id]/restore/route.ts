import { NextResponse } from "next/server";

import { restoreContentRevision } from "@/lib/content-revisions";
import { requireCmsRevisionRestore } from "@/lib/cms-route-guards";
import { writeSiteContent } from "@/lib/content-store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCmsRevisionRestore();

  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const body = (await request.json().catch(() => ({}))) as { summary?: string };
    const snapshot = await restoreContentRevision(numericId);

    await writeSiteContent(snapshot, {
      changedBy: auth.session.username,
      changeSummary: body.summary ?? `Återställd från revision ${numericId}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte återställa revisionen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

