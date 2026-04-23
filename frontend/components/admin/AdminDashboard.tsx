"use client";

import { useEffect, useMemo, useState } from "react";

import { buildCmsDashboard } from "@/lib/cms-dashboard";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";

type AdminDashboardFocus = {
  section: CmsManagedSection;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
};

type RevisionSummary = {
  id: number;
  sectionKey: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

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
}: {
  content: SiteContent;
  allowedSections: CmsManagedSection[];
  onOpenSection: (focus: AdminDashboardFocus) => void;
}) {
  const overview = useMemo(() => buildCmsDashboard(content, allowedSections), [content, allowedSections]);
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [revisionsError, setRevisionsError] = useState<string | null>(null);

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
