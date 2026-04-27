"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { buildCmsDashboard } from "@/lib/cms-dashboard";
import type { CmsMediaIntegrityReport } from "@/lib/cms-media-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";

type AdminDashboardFocus = {
  section: CmsManagedSection;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  targetField?: string;
};

type RevisionSummary = {
  id: number;
  sectionKey: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

type MediaIntegrityResponse = CmsMediaIntegrityReport | { error?: string };

function openUsage(
  onOpenSection: (focus: AdminDashboardFocus) => void,
  usage: CmsMediaIntegrityReport["brokenReferences"][number]["usage"][number],
) {
  onOpenSection({
    section: usage.section as CmsManagedSection,
    targetId: usage.targetId,
    targetTab: usage.targetTab,
    targetAnchorId: usage.targetAnchorId,
    targetField: usage.targetField,
  });
}

function openMediaTask(
  onOpenSection: (focus: AdminDashboardFocus) => void,
  assetId: string,
) {
  onOpenSection({
    section: "media",
    targetId: assetId,
  });
}

function SummaryCard({
  label,
  value,
  tone = "stone",
}: {
  label: string;
  value: string;
  tone?: "stone" | "amber" | "green" | "red";
}) {
  const toneClasses = {
    stone: "border-stone-200 bg-stone-50 text-stone-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-green-200 bg-green-50 text-green-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminDashboard({
  content,
  allowedSections,
  onOpenSection,
  resolvedBrokenMediaUrl,
}: {
  content: SiteContent;
  allowedSections: CmsManagedSection[];
  onOpenSection: (focus: AdminDashboardFocus) => void;
  resolvedBrokenMediaUrl?: string | null;
}) {
  const overview = useMemo(() => buildCmsDashboard(content, allowedSections), [content, allowedSections]);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [revisionsError, setRevisionsError] = useState<string | null>(null);
  const [mediaIntegrity, setMediaIntegrity] = useState<CmsMediaIntegrityReport | null>(null);
  const [mediaIntegrityError, setMediaIntegrityError] = useState<string | null>(null);
  const mediaHealthRef = useRef<HTMLDivElement | null>(null);
  const nextBrokenActionRef = useRef<HTMLButtonElement | null>(null);
  const mediaLibraryActionRef = useRef<HTMLButtonElement | null>(null);

  async function loadMediaIntegrity(signal?: AbortSignal) {
    setMediaIntegrityError(null);

    const response = await fetch("/api/cms/media/integrity", {
      cache: "no-store",
      signal,
    });
    const data = (await response.json()) as MediaIntegrityResponse;

    if (!response.ok) {
      throw new Error("error" in data ? data.error : "Kunde inte lasa mediahalsa.");
    }

    setMediaIntegrity(data as CmsMediaIntegrityReport);
  }

  useEffect(() => {
    if (!allowedSections.includes("revisions")) {
      return;
    }

    let cancelled = false;

    async function loadRevisions() {
      try {
        const response = await fetch("/api/cms/revisions", { cache: "no-store" });
        const data = (await response.json()) as RevisionSummary[] | { error?: string };

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Kunde inte läsa senaste aktivitet.");
        }

        if (!cancelled) {
          setRevisions((data as RevisionSummary[]).slice(0, 6));
        }
      } catch (error) {
        if (!cancelled) {
          setRevisionsError(error instanceof Error ? error.message : "Kunde inte läsa senaste aktivitet.");
        }
      }
    }

    void loadRevisions();

    return () => {
      cancelled = true;
    };
  }, [allowedSections]);

  const nextBrokenReference = mediaIntegrity?.brokenReferences[0] ?? null;
  const resolvedReferenceStillBroken = resolvedBrokenMediaUrl
    ? mediaIntegrity?.brokenReferences.some((reference) => reference.publicUrl === resolvedBrokenMediaUrl) ?? false
    : false;
  const remainingBrokenReferences = mediaIntegrity?.brokenReferenceCount ?? 0;

  useEffect(() => {
    if (!resolvedBrokenMediaUrl || !mediaHealthRef.current) {
      return;
    }

    mediaHealthRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [resolvedBrokenMediaUrl, remainingBrokenReferences]);

  useEffect(() => {
    if (!resolvedBrokenMediaUrl || !nextBrokenReference || !nextBrokenActionRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      nextBrokenActionRef.current?.focus();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [nextBrokenReference, resolvedBrokenMediaUrl]);

  useEffect(() => {
    if (!resolvedBrokenMediaUrl || remainingBrokenReferences > 0 || !mediaLibraryActionRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      mediaLibraryActionRef.current?.focus();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [remainingBrokenReferences, resolvedBrokenMediaUrl]);

  useEffect(() => {
    if (!allowedSections.includes("media")) {
      return;
    }

    const controller = new AbortController();

    async function syncMediaIntegrity() {
      try {
        await loadMediaIntegrity(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) {
          setMediaIntegrityError(error instanceof Error ? error.message : "Kunde inte lasa mediahalsa.");
        }
      }
    }

    void syncMediaIntegrity();

    return () => {
      controller.abort();
    };
  }, [allowedSections, resolvedBrokenMediaUrl]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-stone-900">Översikt</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          Här ser du publiceringsläge, innehåll som kräver åtgärd och den senaste aktiviteten i CMS:et.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Spårade objekt" value={String(overview.totalTrackedItems)} />
        <SummaryCard label="Publicerade" value={String(overview.publishing.published)} tone="green" />
        <SummaryCard label="Schemalagda" value={String(overview.publishing.scheduled)} tone="amber" />
        <SummaryCard label="Objekt med fel" value={String(overview.quality.itemsWithErrors)} tone="red" />
      </div>

      {allowedSections.includes("media") && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Oanvänt media" value={String(mediaIntegrity?.unusedAssets ?? "0")} tone="amber" />
          <SummaryCard label="Saknar alt-text" value={String(mediaIntegrity?.assetsMissingAltText ?? "0")} tone="stone" />
          <SummaryCard label="Svag bildkvalitet" value={String(mediaIntegrity?.lowQualityAssets ?? "0")} tone="amber" />
          <SummaryCard label="Brutna mediaref." value={String(mediaIntegrity?.brokenReferenceCount ?? "0")} tone={(mediaIntegrity?.brokenReferenceCount ?? 0) > 0 ? "red" : "green"} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Kräver åtgärd</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {overview.quality.errors} fel och {overview.quality.warnings} varningar i spårat innehåll.
                </p>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                {overview.attentionItems.length} objekt
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {overview.attentionItems.length === 0 ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                  Inga öppna fel eller varningar i de sektioner du har tillgång till.
                </div>
              ) : (
                overview.attentionItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                          {item.sectionLabel} · {item.itemTypeLabel}
                        </p>
                        <p className="mt-2 text-base font-semibold text-stone-900">{item.title}</p>
                      </div>
                      {item.publishingStatusLabel && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                          {item.publishingStatusLabel}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.errors > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                          {item.errors} fel
                        </span>
                      )}
                      {item.warnings > 0 && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {item.warnings} varningar
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => onOpenSection({
                          section: item.section,
                          targetId: item.targetId,
                          targetTab: item.targetTab,
                          targetAnchorId: item.targetAnchorId,
                        })}
                        className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                      >
                        Öppna i CMS
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-stone-900">Kommande publiceringar och datum</h3>
            <p className="mt-1 text-sm text-stone-600">Visar närmast kommande datum i innehållet, både publiceringar och evenemang.</p>
            <div className="mt-5 space-y-3">
              {overview.upcomingItems.length === 0 ? (
                <p className="text-sm text-stone-500">Inga framtida datum att visa just nu.</p>
              ) : (
                overview.upcomingItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {item.sectionLabel} · {item.itemTypeLabel}
                      </p>
                      <p className="mt-2 font-semibold text-stone-900">{item.title}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                      {item.dateLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenSection({
                        section: item.section,
                        targetId: item.targetId,
                        targetTab: item.targetTab,
                        targetAnchorId: item.targetAnchorId,
                      })}
                      className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                    >
                      Öppna
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {allowedSections.includes("media") && (
            <div
              ref={mediaHealthRef}
              className={`rounded-3xl border bg-white p-6 shadow-lg transition ${
                resolvedBrokenMediaUrl
                  ? "border-amber-300 ring-2 ring-amber-100"
                  : "border-stone-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Mediahälsa</h3>
                  <p className="mt-1 text-sm text-stone-600">Visar oanvänt media, saknade alt-texter och referenser där filen eller asseten saknas.</p>
                </div>
                <button
                  ref={mediaLibraryActionRef}
                  type="button"
                  onClick={() => onOpenSection({ section: "media" })}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                >
                  Öppna media
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {mediaIntegrityError ? (
                  <p className="text-sm text-red-700">{mediaIntegrityError}</p>
                ) : !mediaIntegrity ? (
                  <p className="text-sm text-stone-500">Läser mediahälsa...</p>
                ) : mediaIntegrity.brokenReferences.length === 0 ? (
                  <>
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                      Inga brutna mediareferenser hittades.
                    </div>
                    {(mediaIntegrity.assetsMissingAltTextItems.length > 0 || mediaIntegrity.unusedAssetItems.length > 0 || mediaIntegrity.lowQualityAssetItems.length > 0) && (
                      <div className="grid gap-4 xl:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Saknar alt-text</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.assetsMissingAltTextItems.map((asset) => (
                              <div key={`missing-alt-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.publicUrl}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Oanvänt media</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.unusedAssetItems.map((asset) => (
                              <div key={`unused-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.publicUrl}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Svag bildkvalitet</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.lowQualityAssetItems.map((asset) => (
                              <div key={`low-quality-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.issueLabel ?? "Bildkvalitet behöver ses över"}</p>
                                  {asset.details && <p className="truncate text-xs text-stone-500">{asset.details}</p>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {resolvedBrokenMediaUrl && (
                      <div className={`rounded-2xl border p-4 text-sm ${resolvedReferenceStillBroken ? "border-amber-200 bg-amber-50 text-amber-900" : "border-green-200 bg-green-50 text-green-900"}`}>
                        <p className="font-semibold">
                          {resolvedReferenceStillBroken ? "Senast uppdaterade referensen finns fortfarande kvar i kön." : "Senast uppdaterade referensen är borta från fellistan."}
                        </p>
                        <p className="mt-1 break-all">{resolvedBrokenMediaUrl}</p>
                        {nextBrokenReference && (
                          <p className="mt-2">
                            Nasta brutna referens ar <span className="font-semibold break-all">{nextBrokenReference.publicUrl}</span>.
                          </p>
                        )}
                        <p className="mt-2 font-semibold">
                          {remainingBrokenReferences} brutna referenser kvar.
                        </p>
                        {remainingBrokenReferences > 0 && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            Fortsatt arbetsko aktiv
                          </p>
                        )}
                        {remainingBrokenReferences === 0 && !resolvedReferenceStillBroken && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            Ko rensad
                          </p>
                        )}
                      </div>
                    )}

                    {resolvedBrokenMediaUrl && remainingBrokenReferences === 0 && !resolvedReferenceStillBroken && (
                      <div className="rounded-2xl border border-green-300 bg-green-100 p-4">
                        <p className="text-sm font-semibold text-green-950">Alla brutna mediareferenser ar nu atgardade.</p>
                        <p className="mt-1 text-sm text-green-900">
                          Om du vill kan du ga vidare till mediebiblioteket for att rensa oanvant media eller komplettera alt-texter.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenSection({ section: "media" })}
                            className="rounded-xl bg-green-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                          >
                            Oppna media
                          </button>
                          <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="rounded-xl border border-green-400 bg-white px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-50"
                          >
                            Tillbaka till oversikt
                          </button>
                        </div>
                      </div>
                    )}

                    {nextBrokenReference && (
                      <div className="rounded-2xl border border-red-300 bg-red-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Nasta i kon</p>
                            <p className="mt-2 text-sm font-semibold text-red-950 break-all">{nextBrokenReference.publicUrl}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-red-700">
                              {nextBrokenReference.reason === "missing_asset" ? "Saknas i mediaregistret" : "Filen saknas på disk"}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-900">
                            {nextBrokenReference.usage.length} referenser
                          </span>
                        </div>
                        {nextBrokenReference.usage[0] && (
                          <div className="mt-3">
                            <button
                              ref={nextBrokenActionRef}
                              type="button"
                              onClick={() => openUsage(onOpenSection, nextBrokenReference.usage[0])}
                              className="rounded-xl bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                            >
                              Oppna nasta brutna referens
                            </button>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-800">
                              Enter fortsatter arbetskon
                            </p>
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {nextBrokenReference.usage.map((usage, usageIndex) => (
                            <button
                              key={`${nextBrokenReference.publicUrl}-next-usage-${usageIndex}`}
                              type="button"
                              onClick={() => openUsage(onOpenSection, usage)}
                              className="rounded-xl border border-red-300 bg-white px-4 py-2 text-left text-sm font-semibold text-red-900 transition hover:bg-red-50"
                            >
                              Ersatt bild i {usage.sectionLabel.toLowerCase()} · {usage.itemLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {mediaIntegrity.brokenReferences.slice(nextBrokenReference ? 1 : 0, 6).map((reference, index) => (
                      <div key={`${reference.publicUrl}-${index}`} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-900 break-all">{reference.publicUrl}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-red-700">
                          {reference.reason === "missing_asset" ? "Saknas i mediaregistret" : "Filen saknas på disk"}
                        </p>
                        <div className="mt-3 space-y-2">
                          {reference.usage.map((usage, usageIndex) => (
                            <button
                              key={`${reference.publicUrl}-usage-${usageIndex}`}
                              type="button"
                              onClick={() => openUsage(onOpenSection, usage)}
                              className="block rounded-xl border border-red-300 bg-white px-4 py-2 text-left text-sm font-semibold text-red-900 transition hover:bg-red-100"
                            >
                              Ersatt bild i {usage.sectionLabel.toLowerCase()} · {usage.itemLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {(mediaIntegrity.assetsMissingAltTextItems.length > 0 || mediaIntegrity.unusedAssetItems.length > 0 || mediaIntegrity.lowQualityAssetItems.length > 0) && (
                      <div className="grid gap-4 xl:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Saknar alt-text</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.assetsMissingAltTextItems.map((asset) => (
                              <div key={`missing-alt-with-broken-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.publicUrl}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Oanvänt media</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.unusedAssetItems.map((asset) => (
                              <div key={`unused-with-broken-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.publicUrl}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">Svag bildkvalitet</h4>
                          <div className="mt-3 space-y-2">
                            {mediaIntegrity.lowQualityAssetItems.map((asset) => (
                              <div key={`low-quality-with-broken-${asset.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                                  <p className="truncate text-xs text-stone-500">{asset.issueLabel ?? "Bildkvalitet behöver ses över"}</p>
                                  {asset.details && <p className="truncate text-xs text-stone-500">{asset.details}</p>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openMediaTask(onOpenSection, asset.id)}
                                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                                >
                                  Öppna media
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-stone-900">Publiceringsläge</h3>
            <div className="mt-5 grid gap-3">
              <SummaryCard label="Utkast" value={String(overview.publishing.draft)} />
              <SummaryCard label="Schemalagda" value={String(overview.publishing.scheduled)} tone="amber" />
              <SummaryCard label="Publicerade" value={String(overview.publishing.published)} tone="green" />
              <SummaryCard label="Utgångna" value={String(overview.publishing.expired)} tone="stone" />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-stone-900">Senaste aktivitet</h3>
            <p className="mt-1 text-sm text-stone-600">Senaste revisionerna i CMS:et.</p>
            <div className="mt-5 space-y-3">
              {revisionsError ? (
                <p className="text-sm text-red-700">{revisionsError}</p>
              ) : revisions.length === 0 ? (
                <p className="text-sm text-stone-500">Ingen aktivitet att visa ännu.</p>
              ) : (
                revisions.map((revision) => (
                  <div key={revision.id} className="rounded-2xl border border-stone-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{revision.sectionKey}</p>
                    <p className="mt-2 font-semibold text-stone-900">{revision.changeSummary ?? "Ändring utan sammanfattning"}</p>
                    <p className="mt-2 text-sm text-stone-600">{revision.changedBy}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                      {new Date(revision.createdAt).toLocaleString("sv-SE")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
