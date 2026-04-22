import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySessionCookie } from "@/lib/cms-session-token";

const SESSION_COOKIE = "cms_session";

function isProtectedApiPath(pathname: string) {
  return pathname.startsWith("/api/cms/") && pathname !== "/api/cms/login";
}

function shouldBypassProxy(pathname: string) {
  return pathname === "/api/cms/media" || pathname.startsWith("/api/cms/media/");
}

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && pathname !== "/admin/login";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedApiPath(pathname) && !isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Multipart upload routes are authenticated again inside the route handlers.
  // Bypassing proxy here avoids Next's request-body locking issue on media APIs.
  if (shouldBypassProxy(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.CMS_SESSION_SECRET ?? "local-dev-secret";
  const session = cookieValue ? await verifySessionCookie(cookieValue, secret) : null;

  if (session) {
    return NextResponse.next();
  }

  if (isProtectedApiPath(pathname)) {
    return NextResponse.json({ error: "Obehörig." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/cms/:path*"],
};
