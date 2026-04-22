"use client";

import { useEffect, useState } from "react";

import HeroOverlayField from "@/components/admin/HeroOverlayField";
import MediaPickerField from "@/components/admin/MediaPickerField";
import type { SiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitSocialLinks(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [platform, url] = line.split("|").map((part) => part.trim());
      return { platform: platform ?? "", url: url ?? "" };
    });
}

export default function ContactSectionManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [draft, setDraft] = useState(content.contact);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(content.contact);
  }, [content.contact]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, contact: draft }, {
        sectionKey: "contact",
        changeSummary: "Uppdaterade Kontakt-sektionen",
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
          <h2 className="text-xl font-bold text-stone-900">Kontakt</h2>
          <p className="mt-1 text-sm text-stone-600">Kontaktuppgifter, karta, formulär och SEO.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60">
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Hero-titel</span>
          <input value={draft.heroTitle} onChange={(event) => setDraft((current) => ({ ...current, heroTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Hero-undertitel</span>
          <input value={draft.heroSubtitle} onChange={(event) => setDraft((current) => ({ ...current, heroSubtitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <MediaPickerField value={draft.heroImage} onChange={(value) => setDraft((current) => ({ ...current, heroImage: value }))} label="Hero-bild" />
      <HeroOverlayField value={draft.heroOverlayOpacity} onChange={(value) => setDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />

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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">E-post</span>
          <input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-stone-700">Telefon</span>
          <input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Adressrader, en per rad</span>
        <textarea value={draft.addressLines.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, addressLines: splitLines(event.target.value) }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Sociala länkar, format `Plattform | URL`</span>
        <textarea value={draft.socialLinks.map((item) => `${item.platform} | ${item.url}`).join("\n")} onChange={(event) => setDraft((current) => ({ ...current, socialLinks: splitSocialLinks(event.target.value) }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">Produktinfo, en per rad</span>
        <textarea value={draft.productsInfoParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, productsInfoParagraphs: splitLines(event.target.value) }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      </label>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
