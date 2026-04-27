"use client";

import { useEffect, useState } from "react";

import HeroOverlayField from "@/components/admin/HeroOverlayField";
import MediaPickerField from "@/components/admin/MediaPickerField";
import type { SiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitDraftLines(value: string) {
  return value.split("\n");
}

export default function AboutSectionManager({
  content,
  onSave,
  initialFocusField,
  focusToken,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
  initialFocusField?: string;
  focusToken?: number;
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
      await onSave({ ...content, about: {
        ...draft,
        homepageParagraphs: splitLines(draft.homepageParagraphs.join("\n")),
        historyParagraphs: splitLines(draft.historyParagraphs.join("\n")),
        ingredients: splitLines(draft.ingredients.join("\n")),
        distributionParagraphs: splitLines(draft.distributionParagraphs.join("\n")),
        boardMembers: splitLines(draft.boardMembers.join("\n")),
        alaforsParagraphs: splitLines(draft.alaforsParagraphs.join("\n")),
        alaforsHistoryParagraphs: splitLines(draft.alaforsHistoryParagraphs.join("\n")),
        spinnerParagraphs: splitLines(draft.spinnerParagraphs.join("\n")),
      } }, {
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

  async function autoSaveField(field: "homepageImage" | "pageHeroImage" | "historyImage", nextValue: string) {
    const nextDraft = { ...draft, [field]: nextValue };
    setDraft(nextDraft);
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, about: nextDraft }, {
        sectionKey: "about",
        changeSummary: "Ersatte bild i Om oss",
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
        <MediaPickerField value={draft.homepageImage} onChange={(value) => setDraft((current) => ({ ...current, homepageImage: value }))} label="Startsidebild" fieldId="homepageImage" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={(value) => autoSaveField("homepageImage", value)} />
        <MediaPickerField value={draft.pageHeroImage} onChange={(value) => setDraft((current) => ({ ...current, pageHeroImage: value }))} label="Hero-bild" fieldId="pageHeroImage" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={(value) => autoSaveField("pageHeroImage", value)} />
        <MediaPickerField value={draft.historyImage} onChange={(value) => setDraft((current) => ({ ...current, historyImage: value }))} label="Historiebild" fieldId="historyImage" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={(value) => autoSaveField("historyImage", value)} />
      </div>

      <HeroOverlayField value={draft.pageHeroOverlayOpacity} onChange={(value) => setDraft((current) => ({ ...current, pageHeroOverlayOpacity: value }))} />

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Startsidans stycken, en per rad</span>
        <textarea value={draft.homepageParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, homepageParagraphs: splitDraftLines(event.target.value) }))} rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Historietext, en per rad</span>
        <textarea value={draft.historyParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, historyParagraphs: splitDraftLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
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
        <textarea value={draft.ingredients.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, ingredients: splitDraftLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Distribution, en per rad</span>
        <textarea value={draft.distributionParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, distributionParagraphs: splitDraftLines(event.target.value) }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Styrelse</h3>
        <p className="mt-1 text-sm text-stone-600">Information om ordförande, ledamöter och revisor.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Rubrik</span>
            <input value={draft.boardTitle} onChange={(event) => setDraft((current) => ({ ...current, boardTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Ingress</span>
            <input value={draft.boardIntro} onChange={(event) => setDraft((current) => ({ ...current, boardIntro: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Ordförande - titel</span>
            <input value={draft.chairTitle} onChange={(event) => setDraft((current) => ({ ...current, chairTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Ordförande - namn</span>
            <input value={draft.chairName} onChange={(event) => setDraft((current) => ({ ...current, chairName: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Ledamöter - rubrik</span>
            <input value={draft.boardMembersTitle} onChange={(event) => setDraft((current) => ({ ...current, boardMembersTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Revisor - titel</span>
            <input value={draft.auditorTitle} onChange={(event) => setDraft((current) => ({ ...current, auditorTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Ledamöter, en per rad</span>
          <textarea value={draft.boardMembers.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, boardMembers: splitDraftLines(event.target.value) }))} rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Revisor - namn</span>
          <input value={draft.auditorName} onChange={(event) => setDraft((current) => ({ ...current, auditorName: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Orten Alafors</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Rubrik</span>
            <input value={draft.alaforsTitle} onChange={(event) => setDraft((current) => ({ ...current, alaforsTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Historierubrik</span>
            <input value={draft.alaforsHistoryTitle} onChange={(event) => setDraft((current) => ({ ...current, alaforsHistoryTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Inledning, en per rad</span>
          <textarea value={draft.alaforsParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, alaforsParagraphs: splitDraftLines(event.target.value) }))} rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Historia, en per rad</span>
          <textarea value={draft.alaforsHistoryParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, alaforsHistoryParagraphs: splitDraftLines(event.target.value) }))} rows={8} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Spinnerifabriken</h3>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Rubrik</span>
          <input value={draft.spinnerTitle} onChange={(event) => setDraft((current) => ({ ...current, spinnerTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Stycken, en per rad</span>
          <textarea value={draft.spinnerParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, spinnerParagraphs: splitDraftLines(event.target.value) }))} rows={8} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
