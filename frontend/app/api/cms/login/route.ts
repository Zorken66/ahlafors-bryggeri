import { NextResponse } from "next/server";

import { clearFailedLogins, getRemainingBlockMs, registerFailedLogin } from "@/lib/cms-rate-limit";
import { createCmsSession, verifyCmsCredentials } from "@/lib/cms-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password?.trim() ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const blockMs = await getRemainingBlockMs(ip, username);

  if (blockMs > 0) {
    return NextResponse.json(
      { error: `För många försök. Vänta ${Math.ceil(blockMs / 1000)} sekunder.` },
      { status: 429 },
    );
  }

  const user = await verifyCmsCredentials(username, password);

  if (!user) {
    await registerFailedLogin(ip, username);
    return NextResponse.json({ error: "Fel användarnamn eller lösenord." }, { status: 401 });
  }

  await clearFailedLogins(ip, username);
  await createCmsSession(user.username, {
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
