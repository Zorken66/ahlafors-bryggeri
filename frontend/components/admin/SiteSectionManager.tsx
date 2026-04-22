"use client";

import { useEffect, useState } from "react";

import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function SiteSectionManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [draft, setDraft] = useState(content.site);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content.site);
  }, [content.site]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, site: draft }, {
        sectionKey: "site",
        changeSummary: "Uppdaterade webbplatsmetadata",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Site</h2>
          <p className="mt-1 text-sm text-stone-600">Global metadata och grundinställningar för sajten.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Företagsnamn</span>
            <input value={draft.companyName} onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-titel</span>
            <input value={draft.metadataTitle} onChange={(event) => setDraft((current) => ({ ...current, metadataTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-beskrivning</span>
          <textarea value={draft.metadataDescription} onChange={(event) => setDraft((current) => ({ ...current, metadataDescription: event.target.value }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-nyckelord, ett per rad</span>
          <textarea value={draft.metadataKeywords.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, metadataKeywords: splitLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
