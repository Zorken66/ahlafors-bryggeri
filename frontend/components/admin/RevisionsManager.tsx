"use client";

import { useEffect, useState } from "react";

type Revision = {
  id: number;
  sectionKey: string;
  changedBy: string;
  changeSummary: string | null;
  createdAt: string;
};

type RevisionDetail = Revision & {
  revisionContent: string;
  currentContent: string;
};

export default function RevisionsManager({ canRestore }: { canRestore: boolean }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<RevisionDetail | null>(null);

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
          {revisions.map((revision) => (
            <div key={revision.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-stone-900">{revision.sectionKey}</p>
                <p className="text-sm text-stone-600">{revision.changeSummary ?? "Ingen sammanfattning"} · {revision.changedBy}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{new Date(revision.createdAt).toLocaleString("sv-SE")}</p>
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
                <p className="mt-1 text-sm text-stone-600">{selectedRevision.sectionKey} · {selectedRevision.changeSummary ?? "Ingen sammanfattning"}</p>
              </div>
              <button type="button" onClick={() => setSelectedRevision(null)} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700">
                Stäng
              </button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
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
