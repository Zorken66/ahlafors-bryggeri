"use client";

import { useEffect, useState } from "react";

type Revision = {
  id: number;
  sectionKey: string;
  sectionLabel: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

type RevisionDetail = Revision & {
  revisionContent: string;
  currentContent: string;
  diffSummary: {
    totalChanges: number;
    added: number;
    removed: number;
    changed: number;
  };
  diffEntries: Array<{
    path: string;
    label: string;
    changeType: "added" | "removed" | "changed";
    previousValue: string;
    currentValue: string;
  }>;
  groupedDiffEntries: Array<{
    groupKey: string;
    groupLabel: string;
    totalChanges: number;
    entries: Array<{
      path: string;
      label: string;
      changeType: "added" | "removed" | "changed";
      previousValue: string;
      currentValue: string;
    }>;
  }>;
};

function getRevisionDayLabel(value: string) {
  const revisionDate = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(revisionDate.getFullYear(), revisionDate.getMonth(), revisionDate.getDate()).getTime();
  const diffDays = Math.round((today - target) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return "Idag";
  }

  if (diffDays === 1) {
    return "Igår";
  }

  return revisionDate.toLocaleDateString("sv-SE", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function RevisionsManager({ canRestore }: { canRestore: boolean }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<RevisionDetail | null>(null);
  const groupedRevisions = revisions.reduce<Array<{ label: string; entries: Revision[] }>>((groups, revision) => {
    const label = getRevisionDayLabel(revision.createdAt);
    const existing = groups.find((group) => group.label === label);

    if (existing) {
      existing.entries.push(revision);
      return groups;
    }

    groups.push({ label, entries: [revision] });
    return groups;
  }, []);

  async function loadRevisions() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/cms/revisions", { cache: "no-store" });
      const data = (await response.json()) as Revision[] | { error?: string };

      if (!response.ok) {
        throw new Error("Kunde inte läsa revisionshistorik.");
      }

      setRevisions(data as Revision[]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa revisionshistorik.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRevisions();
  }, []);

  async function handleInspect(id: number) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/revisions/${id}`, { cache: "no-store" });
      const data = (await response.json()) as RevisionDetail | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Kunde inte läsa revisionen.");
      }

      setSelectedRevision(data as RevisionDetail);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte läsa revisionen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(id: number) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/revisions/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: `Återställde revision ${id}` }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte återställa revisionen.");
      }

      setStatus("Revision återställd. Ladda om sidan för att se innehållet.");
      await loadRevisions();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte återställa revisionen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-stone-900">Revisionshistorik</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Varje sparning skapar en revision som kan granskas, jämföras och återställas.</p>
      </div>
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <div className="space-y-4">
          {groupedRevisions.map((group) => (
            <section key={group.label} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{group.label}</h3>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              {group.entries.map((revision) => (
                <div key={revision.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{revision.sectionLabel}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-stone-400">{new Date(revision.createdAt).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="font-semibold text-stone-900">{revision.changeSummary ?? `Ändring i ${revision.sectionLabel.toLowerCase()}`}</p>
                    <p className="text-sm text-stone-600">Ändrad av {revision.changedBy}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" disabled={loading} onClick={() => void handleInspect(revision.id)} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700">
                      Jämför
                    </button>
                    {canRestore && (
                      <button type="button" disabled={loading} onClick={() => void handleRestore(revision.id)} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700">
                        Återställ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
          {revisions.length === 0 && !loading && <p className="text-sm text-stone-500">Inga revisioner ännu.</p>}
        </div>
        {status && <p className={`mt-4 text-sm ${status.includes("inte") || status.includes("Kunde") ? "text-red-700" : "text-green-700"}`}>{status}</p>}
      </div>

      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-6">
          <div className="max-h-[85vh] w-full max-w-7xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Jämför revision</h3>
                <p className="mt-1 text-sm text-stone-600">{selectedRevision.sectionLabel} · {selectedRevision.changeSummary ?? "Ingen sammanfattning"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">{selectedRevision.changedBy} · {new Date(selectedRevision.createdAt).toLocaleString("sv-SE")}</p>
              </div>
              <button type="button" onClick={() => setSelectedRevision(null)} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700">
                Stäng
              </button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Fält med ändringar</p>
                    <p className="mt-3 text-3xl font-bold text-stone-900">{selectedRevision.diffSummary.totalChanges}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Ändrade</p>
                    <p className="mt-3 text-3xl font-bold text-amber-900">{selectedRevision.diffSummary.changed}</p>
                  </div>
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Tillagda</p>
                    <p className="mt-3 text-3xl font-bold text-green-900">{selectedRevision.diffSummary.added}</p>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Borttagna</p>
                    <p className="mt-3 text-3xl font-bold text-red-900">{selectedRevision.diffSummary.removed}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Fältdiff</h4>
                <div className="space-y-3">
                  {selectedRevision.groupedDiffEntries.length === 0 ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                      Inga skillnader hittades mellan revisionen och nuvarande innehåll.
                    </div>
                  ) : (
                    selectedRevision.groupedDiffEntries.map((group) => (
                      <section key={group.groupKey} className="rounded-2xl border border-stone-200 p-4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                          <div>
                            <p className="font-semibold text-stone-900">{group.groupLabel}</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{group.totalChanges} ändringar</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {group.entries.map((entry) => (
                            <article key={`${entry.path}-${entry.changeType}`} className="rounded-2xl border border-stone-200 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{entry.label}</p>
                                  <code className="mt-2 inline-block rounded-lg bg-stone-100 px-3 py-1 text-xs text-stone-700">{entry.path}</code>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  entry.changeType === "added"
                                    ? "bg-green-100 text-green-800"
                                    : entry.changeType === "removed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}>
                                  {entry.changeType === "added" ? "Tillagt" : entry.changeType === "removed" ? "Borttaget" : "Ändrat"}
                                </span>
                              </div>
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl bg-stone-50 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Revision</p>
                                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-stone-800">{entry.previousValue}</p>
                                </div>
                                <div className="rounded-2xl bg-stone-50 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Nuvarande innehåll</p>
                                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-stone-800">{entry.currentValue}</p>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Revision</h4>
                <pre className="min-h-[50vh] overflow-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100">{selectedRevision.revisionContent}</pre>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Nuvarande innehåll</h4>
                <pre className="min-h-[50vh] overflow-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100">{selectedRevision.currentContent}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
