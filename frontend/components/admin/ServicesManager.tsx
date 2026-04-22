"use client";

import { useEffect, useMemo, useState } from "react";

import type { SiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import MediaPickerField from "@/components/admin/MediaPickerField";
import HeroOverlayField from "@/components/admin/HeroOverlayField";
import SectionTabs from "@/components/admin/SectionTabs";

type Service = SiteContent["services"][number];

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

const emptyService: Service = {
  id: "",
  title: "",
  shortDescription: "",
  description: "",
  details: [],
  icon: "",
  link: "",
  published: true,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export default function ServicesManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.services[0]?.id ?? null);
  const [draft, setDraft] = useState<Service | null>(null);
  const [pageDraft, setPageDraft] = useState({ ...content.servicesPage });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"page" | "services">("page");

  const services = useMemo(() => content.services, [content.services]);
  const selected = services.find((service) => service.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  useEffect(() => {
    setPageDraft({ ...content.servicesPage });
  }, [content.servicesPage]);

  async function saveServices(nextServices: SiteContent["services"]) {
    setSaving(true);
    setStatus(null);
    try {
      await onSave({ ...content, services: nextServices }, {
        sectionKey: "services",
        changeSummary: "Uppdaterade tjänster",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara tjänster.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const id = crypto.randomUUID();
    const next = { ...emptyService, id, publishedAt: new Date().toISOString().slice(0, 10) };
    await saveServices([next, ...content.services]);
    setSelectedId(id);
  }

  async function handleDelete(id: string) {
    const next = content.services.filter((service) => service.id !== id);
    setSelectedId(next[0]?.id ?? null);
    await saveServices(next);
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    await saveServices(content.services.map((service) => service.id === draft.id ? draft : service));
  }

  async function handleSavePage() {
    setSaving(true);
    setStatus(null);
    try {
      await onSave({ ...content, servicesPage: pageDraft }, {
        sectionKey: "servicesPage",
        changeSummary: "Uppdaterade tjänstesidans inställningar",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara sidinställningarna.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTabs
        tabs={[
          { id: "page", label: "Sida" },
          { id: "services", label: "Tjänster" },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as "page" | "services")}
      />

      {activeTab === "page" ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Tjänstesida</h2>
              <p className="mt-1 text-sm text-stone-600">Hero, intro, CTA och SEO för tjänstesidan.</p>
            </div>
            <button type="button" onClick={() => void handleSavePage()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara sidinställningar"}</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={pageDraft.heroTitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroTitle: event.target.value }))} placeholder="Hero-rubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
            <input value={pageDraft.heroSubtitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroSubtitle: event.target.value }))} placeholder="Hero-underrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <MediaPickerField value={pageDraft.heroImage} onChange={(value) => setPageDraft((current) => ({ ...current, heroImage: value }))} label="Hero-bild" />
          <HeroOverlayField label="Hero-overlay" value={pageDraft.heroOverlayOpacity} onChange={(value) => setPageDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
          <textarea value={pageDraft.introText} onChange={(event) => setPageDraft((current) => ({ ...current, introText: event.target.value }))} rows={4} placeholder="Introduktion" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={pageDraft.seoTitle ?? ""} onChange={(event) => setPageDraft((current) => ({ ...current, seoTitle: event.target.value }))} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
            <input value={pageDraft.seoDescription ?? ""} onChange={(event) => setPageDraft((current) => ({ ...current, seoDescription: event.target.value }))} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">CTA</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <input value={pageDraft.ctaTitle} onChange={(event) => setPageDraft((current) => ({ ...current, ctaTitle: event.target.value }))} placeholder="CTA-rubrik" className="rounded-xl border border-stone-300 px-4 py-3 md:col-span-2" />
              <textarea value={pageDraft.ctaText} onChange={(event) => setPageDraft((current) => ({ ...current, ctaText: event.target.value }))} rows={3} placeholder="CTA-text" className="w-full rounded-xl border border-stone-300 px-4 py-3 md:col-span-2" />
              <input value={pageDraft.ctaPrimaryLabel} onChange={(event) => setPageDraft((current) => ({ ...current, ctaPrimaryLabel: event.target.value }))} placeholder="Primär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={pageDraft.ctaPrimaryLink} onChange={(event) => setPageDraft((current) => ({ ...current, ctaPrimaryLink: event.target.value }))} placeholder="Primär länk" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={pageDraft.ctaSecondaryLabel} onChange={(event) => setPageDraft((current) => ({ ...current, ctaSecondaryLabel: event.target.value }))} placeholder="Sekundär knapptext" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={pageDraft.ctaSecondaryLink} onChange={(event) => setPageDraft((current) => ({ ...current, ctaSecondaryLink: event.target.value }))} placeholder="Sekundär länk" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>
          </div>
        </section>
      ) : (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
        <button type="button" onClick={() => void handleCreate()} disabled={saving} className="mb-4 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">
          Ny tjänst
        </button>
        <div className="space-y-3">
          {services.map((service) => (
            <button key={service.id} type="button" onClick={() => setSelectedId(service.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === service.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-stone-900">{service.title || "Utan titel"}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${(service.published ?? true) ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                  {(service.published ?? true) ? "Publik" : "Utkast"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Tjänster</h2>
              <div className="flex gap-3">
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara"}</button>
                <button type="button" onClick={() => void handleDelete(draft.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Ta bort</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.icon} onChange={(event) => setDraft((current) => current ? { ...current, icon: event.target.value } : current)} placeholder="Ikon" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.link} onChange={(event) => setDraft((current) => current ? { ...current, link: event.target.value } : current)} placeholder="Länk" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input type="date" value={draft.publishedAt ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, publishedAt: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <textarea value={draft.shortDescription} onChange={(event) => setDraft((current) => current ? { ...current, shortDescription: event.target.value } : current)} placeholder="Kort beskrivning" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} placeholder="Lång beskrivning" rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={draft.details.join("\n")} onChange={(event) => setDraft((current) => current ? { ...current, details: splitLines(event.target.value) } : current)} placeholder="Detaljer, en per rad" rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoTitle: event.target.value } : current)} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoDescription: event.target.value } : current)} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.published ?? true} onChange={(event) => setDraft((current) => current ? { ...current, published: event.target.checked } : current)} /> Publicerad</label>

            {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
          </div>
        ) : <p className="text-sm text-stone-500">Välj en tjänst eller skapa en ny.</p>}
      </section>
    </div>
      )}
    </div>
  );
}
