import { notFound, permanentRedirect, redirect } from "next/navigation";

import { readSiteContent } from "@/lib/content-store";

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const withoutTrailingSlash = pathname.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

function appendSearch(destination: string, searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();

  if (!queryString) {
    return destination;
  }

  return `${destination}${destination.includes("?") ? "&" : "?"}${queryString}`;
}

export default async function LegacyRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const requestedPath = normalizePath(`/${slug.join("/")}`);
  const { site } = await readSiteContent();
  const match = site.redirects.find((entry) => normalizePath(entry.source) === requestedPath);

  if (!match) {
    notFound();
  }

  const destination = appendSearch(match.destination, resolvedSearchParams);

  if (match.permanent) {
    permanentRedirect(destination);
  }

  redirect(destination);
}
