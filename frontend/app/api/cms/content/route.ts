import { NextResponse } from "next/server";

import { assertSiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import { requireCmsSectionAccess } from "@/lib/cms-route-guards";
import { readSiteContent, writeSiteContent } from "@/lib/content-store";

export async function GET() {
  const auth = await requireCmsSectionAccess("site");

  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await readSiteContent());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      content?: unknown;
      sectionKey?: CmsManagedSection;
      changeSummary?: string;
    } | unknown;
    const payload = body && typeof body === "object" && "content" in body
      ? body as { content: unknown; sectionKey?: CmsManagedSection; changeSummary?: string }
      : { content: body as unknown, sectionKey: undefined, changeSummary: undefined };
    const sectionKey = payload.sectionKey ?? "site";
    const auth = await requireCmsSectionAccess(sectionKey);

    if (auth.error) {
      return auth.error;
    }

    assertSiteContent(payload.content);
    await writeSiteContent(payload.content, {
      changedBy: auth.session.username,
      sectionKey,
      changeSummary: payload.changeSummary,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte spara CMS-innehållet.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
