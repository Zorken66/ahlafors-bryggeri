"use client";

import { useEffect, useState } from "react";

import HeroOverlayField from "@/components/admin/HeroOverlayField";
import MediaPickerField from "@/components/admin/MediaPickerField";
import type { SiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function AboutSectionManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [draft, setDraft] = useState(content.about);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(content.about);
  }, [content.about]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, about: draft }, {
        sectionKey: "about",
        changeSummary: "Uppdaterade Om oss-sektionen",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara sektionen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Om oss</h2>
          <p className="mt-1 text-sm text-stone-600">Strukturerad redigering för innehåll och SEO.</p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Hero-titel</span>
          <input value={draft.pageHeroTitle} onChange={(event) => setDraft((current) => ({ ...current, pageHeroTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Hero-undertitel</span>
          <input value={draft.pageHeroSubtitle} onChange={(event) => setDraft((current) => ({ ...current, pageHeroSubtitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-titel</span>
          <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => ({ ...current, seoTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-beskrivning</span>
          <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => ({ ...current, seoDescription: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Ingress på startsidan</span>
        <input value={draft.homepageHeading} onChange={(event) => setDraft((current) => ({ ...current, homepageHeading: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <MediaPickerField value={draft.homepageImage} onChange={(value) => setDraft((current) => ({ ...current, homepageImage: value }))} label="Startsidebild" />
        <MediaPickerField value={draft.pageHeroImage} onChange={(value) => setDraft((current) => ({ ...current, pageHeroImage: value }))} label="Hero-bild" />
        <MediaPickerField value={draft.historyImage} onChange={(value) => setDraft((current) => ({ ...current, historyImage: value }))} label="Historiebild" />
      </div>

      <HeroOverlayField value={draft.pageHeroOverlayOpacity} onChange={(value) => setDraft((current) => ({ ...current, pageHeroOverlayOpacity: value }))} />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Startsidans stycken, en per rad</span>
        <textarea value={draft.homepageParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, homepageParagraphs: splitLines(event.target.value) }))} rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Historietext, en per rad</span>
        <textarea value={draft.historyParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, historyParagraphs: splitLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Craft-rubrik</span>
          <input value={draft.craftTitle} onChange={(event) => setDraft((current) => ({ ...current, craftTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Besök oss-rubrik</span>
          <input value={draft.locationTitle} onChange={(event) => setDraft((current) => ({ ...current, locationTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Ingredienser, en per rad</span>
        <textarea value={draft.ingredients.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, ingredients: splitLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Distribution, en per rad</span>
        <textarea value={draft.distributionParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, distributionParagraphs: splitLines(event.target.value) }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
