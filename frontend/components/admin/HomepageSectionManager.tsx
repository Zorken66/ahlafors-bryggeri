"use client";

import { useEffect, useState } from "react";

import HeroOverlayField from "@/components/admin/HeroOverlayField";
import FieldIssueHint from "@/components/admin/FieldIssueHint";
import MediaPickerField from "@/components/admin/MediaPickerField";
import QualityChecklist from "@/components/admin/QualityChecklist";
import { validateHomepage } from "@/lib/content-quality";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { HomepageSectionId, SiteContent } from "@/lib/content-schema";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitDraftLines(value: string) {
  return value.split("\n");
}

const sectionLabels: Record<HomepageSectionId, string> = {
  hero: "Hero",
  anniversary: "Jubileum",
  about: "Om oss",
  products: "Produkter",
  news: "Nyheter",
  services: "Tjänster",
  cta: "Nedre CTA",
};

export default function HomepageSectionManager({
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
  const [draft, setDraft] = useState(content.homepage);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const qualityIssues = validateHomepage(draft);

  useEffect(() => {
    setDraft(content.homepage);
  }, [content.homepage]);

  function moveSection(id: HomepageSectionId, direction: -1 | 1) {
    setDraft((current) => {
      const index = current.sectionOrder.findIndex((section) => section.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.sectionOrder.length) {
        return current;
      }

      const nextOrder = [...current.sectionOrder];
      const [moved] = nextOrder.splice(index, 1);
      nextOrder.splice(nextIndex, 0, moved);
      return { ...current, sectionOrder: nextOrder };
    });
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, homepage: {
        ...draft,
        anniversaryHighlights: splitLines(draft.anniversaryHighlights.join("\n")),
        ctaCards: draft.ctaCards.map((card) => ({
          ...card,
          lines: splitLines(card.lines.join("\n")),
        })),
      } }, {
        sectionKey: "homepage",
        changeSummary: "Uppdaterade förstasidan",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  async function autoSaveField(field: "heroBackgroundImage" | "anniversaryImage", nextValue: string) {
    const nextDraft = { ...draft, [field]: nextValue };
    setDraft(nextDraft);
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, homepage: nextDraft }, {
        sectionKey: "homepage",
        changeSummary: field === "heroBackgroundImage" ? "Ersatte hero-bild på förstasidan" : "Ersatte jubileumsbild på förstasidan",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Förstasida</h2>
          <p className="mt-1 text-sm text-stone-600">Hero, blockrubriker och CTA för startsidan.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      <QualityChecklist title="Kvalitet på förstasidan" issues={qualityIssues} />

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Blockordning</h3>
        <p className="mt-1 text-sm text-stone-600">Välj vilka block som visas på startsidan och i vilken ordning.</p>
        <div className="mt-4 space-y-3">
          {draft.sectionOrder.map((section, index) => (
            <div key={section.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-stone-900">{sectionLabels[section.id]}</p>
                  <p className="text-xs text-stone-500">{section.enabled ? "Visas på startsidan" : "Dold på startsidan"}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => setDraft((current) => ({
                      ...current,
                      sectionOrder: current.sectionOrder.map((entry) => entry.id === section.id ? { ...entry, enabled: e.target.checked } : entry),
                    }))}
                  />
                  Visa
                </label>
                <button type="button" onClick={() => moveSection(section.id, -1)} disabled={index === 0} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40">Upp</button>
                <button type="button" onClick={() => moveSection(section.id, 1)} disabled={index === draft.sectionOrder.length - 1} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40">Ner</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Hero</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input value={draft.heroEyebrow} onChange={(e) => setDraft((current) => ({ ...current, heroEyebrow: e.target.value }))} placeholder="Eyebrow" className="rounded-xl border border-stone-300 px-4 py-3" />
          <input value={draft.heroTagline} onChange={(e) => setDraft((current) => ({ ...current, heroTagline: e.target.value }))} placeholder="Tagline" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div className="md:col-span-2">
            <input value={draft.heroTitle} onChange={(e) => setDraft((current) => ({ ...current, heroTitle: e.target.value }))} placeholder="Hero-rubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="heroTitle" />
          </div>
          <div className="md:col-span-2">
            <textarea value={draft.heroLead} onChange={(e) => setDraft((current) => ({ ...current, heroLead: e.target.value }))} placeholder="Hero-underrubrik" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <textarea value={draft.heroBody} onChange={(e) => setDraft((current) => ({ ...current, heroBody: e.target.value }))} placeholder="Kort brödtext under hero" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <MediaPickerField value={draft.heroBackgroundImage} onChange={(value) => setDraft((current) => ({ ...current, heroBackgroundImage: value }))} label="Hero-bakgrund" fieldId="heroBackgroundImage" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={(value) => autoSaveField("heroBackgroundImage", value)} />
            <FieldIssueHint issues={qualityIssues} field="heroBackgroundImage" />
          </div>
          <div className="md:col-span-2">
            <HeroOverlayField value={draft.heroOverlayOpacity} onChange={(value) => setDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
          </div>
          <input value={draft.heroPrimaryCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, heroPrimaryCtaLabel: e.target.value }))} placeholder="Primär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.heroPrimaryCtaLink} onChange={(e) => setDraft((current) => ({ ...current, heroPrimaryCtaLink: e.target.value }))} placeholder="Primär knapplänk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="heroPrimaryCtaLink" />
          </div>
          <input value={draft.heroSecondaryCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, heroSecondaryCtaLabel: e.target.value }))} placeholder="Sekundär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.heroSecondaryCtaLink} onChange={(e) => setDraft((current) => ({ ...current, heroSecondaryCtaLink: e.target.value }))} placeholder="Sekundär knapplänk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="heroSecondaryCtaLink" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Jubileumsblock</h3>
        <p className="mt-1 text-sm text-stone-600">Eget block för jubileum, kampanj eller annan större berättelse på startsidan.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input value={draft.anniversaryEyebrow} onChange={(e) => setDraft((current) => ({ ...current, anniversaryEyebrow: e.target.value }))} placeholder="Eyebrow" className="rounded-xl border border-stone-300 px-4 py-3" />
          <input value={draft.anniversaryBadge} onChange={(e) => setDraft((current) => ({ ...current, anniversaryBadge: e.target.value }))} placeholder="Badge, t.ex. 30 år" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div className="md:col-span-2">
            <input value={draft.anniversaryTitle} onChange={(e) => setDraft((current) => ({ ...current, anniversaryTitle: e.target.value }))} placeholder="Jubileumsrubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <textarea value={draft.anniversaryLead} onChange={(e) => setDraft((current) => ({ ...current, anniversaryLead: e.target.value }))} placeholder="Jubileumsingress" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <textarea value={draft.anniversaryBody} onChange={(e) => setDraft((current) => ({ ...current, anniversaryBody: e.target.value }))} placeholder="Brödtext" rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="md:col-span-2">
            <MediaPickerField value={draft.anniversaryImage} onChange={(value) => setDraft((current) => ({ ...current, anniversaryImage: value }))} label="Jubileumsbild" fieldId="anniversaryImage" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={(value) => autoSaveField("anniversaryImage", value)} />
            <FieldIssueHint issues={qualityIssues} field="anniversaryImage" />
          </div>
          <div className="md:col-span-2">
            <textarea value={draft.anniversaryHighlights.join("\n")} onChange={(e) => setDraft((current) => ({ ...current, anniversaryHighlights: splitDraftLines(e.target.value) }))} placeholder="Höjdpunkter, en per rad" rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <input value={draft.anniversaryPrimaryCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, anniversaryPrimaryCtaLabel: e.target.value }))} placeholder="Primär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <input value={draft.anniversaryPrimaryCtaLink} onChange={(e) => setDraft((current) => ({ ...current, anniversaryPrimaryCtaLink: e.target.value }))} placeholder="Primär knapplänk" className="rounded-xl border border-stone-300 px-4 py-3" />
          <input value={draft.anniversarySecondaryCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, anniversarySecondaryCtaLabel: e.target.value }))} placeholder="Sekundär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <input value={draft.anniversarySecondaryCtaLink} onChange={(e) => setDraft((current) => ({ ...current, anniversarySecondaryCtaLink: e.target.value }))} placeholder="Sekundär knapplänk" className="rounded-xl border border-stone-300 px-4 py-3" />
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Startsidans block</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <input value={draft.productsTitle} onChange={(e) => setDraft((current) => ({ ...current, productsTitle: e.target.value }))} placeholder="Produktrubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="productsTitle" />
          </div>
          <input value={draft.productsCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, productsCtaLabel: e.target.value }))} placeholder="Produktknapp" className="rounded-xl border border-stone-300 px-4 py-3" />
          <textarea value={draft.productsIntro} onChange={(e) => setDraft((current) => ({ ...current, productsIntro: e.target.value }))} placeholder="Produktintro" rows={3} className="md:col-span-2 w-full rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.newsTitle} onChange={(e) => setDraft((current) => ({ ...current, newsTitle: e.target.value }))} placeholder="Nyhetsrubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="newsTitle" />
          </div>
          <input value={draft.newsCtaLabel} onChange={(e) => setDraft((current) => ({ ...current, newsCtaLabel: e.target.value }))} placeholder="Nyhetsknapp" className="rounded-xl border border-stone-300 px-4 py-3" />
          <textarea value={draft.newsIntro} onChange={(e) => setDraft((current) => ({ ...current, newsIntro: e.target.value }))} placeholder="Nyhetsintro" rows={3} className="md:col-span-2 w-full rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.servicesTitle} onChange={(e) => setDraft((current) => ({ ...current, servicesTitle: e.target.value }))} placeholder="Tjänsterubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="servicesTitle" />
          </div>
          <input value={draft.servicesIntro} onChange={(e) => setDraft((current) => ({ ...current, servicesIntro: e.target.value }))} placeholder="Tjänsteintro" className="rounded-xl border border-stone-300 px-4 py-3" />
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-lg font-bold text-stone-900">Nedre CTA</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <input value={draft.ctaTitle} onChange={(e) => setDraft((current) => ({ ...current, ctaTitle: e.target.value }))} placeholder="CTA-rubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="ctaTitle" />
          </div>
          <input value={draft.ctaLead} onChange={(e) => setDraft((current) => ({ ...current, ctaLead: e.target.value }))} placeholder="CTA-ingress" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div className="md:col-span-2">
            <textarea value={draft.ctaBody} onChange={(e) => setDraft((current) => ({ ...current, ctaBody: e.target.value }))} placeholder="CTA-brödtext" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <input value={draft.ctaPrimaryLabel} onChange={(e) => setDraft((current) => ({ ...current, ctaPrimaryLabel: e.target.value }))} placeholder="Primär CTA-knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.ctaPrimaryLink} onChange={(e) => setDraft((current) => ({ ...current, ctaPrimaryLink: e.target.value }))} placeholder="Primär CTA-länk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="ctaPrimaryLink" />
          </div>
          <input value={draft.ctaSecondaryLabel} onChange={(e) => setDraft((current) => ({ ...current, ctaSecondaryLabel: e.target.value }))} placeholder="Sekundär CTA-knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
          <div>
            <input value={draft.ctaSecondaryLink} onChange={(e) => setDraft((current) => ({ ...current, ctaSecondaryLink: e.target.value }))} placeholder="Sekundär CTA-länk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <FieldIssueHint issues={qualityIssues} field="ctaSecondaryLink" />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {draft.ctaCards.map((card, index) => (
            <div key={`cta-card-${index}`} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="grid gap-3">
                <input value={card.icon} onChange={(e) => setDraft((current) => ({ ...current, ctaCards: current.ctaCards.map((entry, entryIndex) => entryIndex === index ? { ...entry, icon: e.target.value } : entry) }))} placeholder="Ikon" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={card.title} onChange={(e) => setDraft((current) => ({ ...current, ctaCards: current.ctaCards.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: e.target.value } : entry) }))} placeholder="Rubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
                <textarea value={card.lines.join("\n")} onChange={(e) => setDraft((current) => ({ ...current, ctaCards: current.ctaCards.map((entry, entryIndex) => entryIndex === index ? { ...entry, lines: splitDraftLines(e.target.value) } : entry) }))} placeholder="En rad per rad" rows={4} className="rounded-xl border border-stone-300 px-4 py-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
