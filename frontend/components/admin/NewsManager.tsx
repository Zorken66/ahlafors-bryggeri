"use client";

import { useEffect, useMemo, useState } from "react";

import MediaPickerField from "@/components/admin/MediaPickerField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";

type NewsItem = SiteContent["news"][number];

const emptyNews: NewsItem = {
  id: "",
  title: "",
  excerpt: "",
  date: "",
  image: "",
  link: "",
  featured: false,
  published: true,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export default function NewsManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.news[0]?.id ?? null);
  const [draft, setDraft] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const items = useMemo(() => content.news, [content.news]);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  async function saveNews(nextNews: SiteContent["news"]) {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, news: nextNews }, {
        sectionKey: "news",
        changeSummary: "Uppdaterade nyheter",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara nyheter.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const id = crypto.randomUUID();
    const next = { ...emptyNews, id, date: new Date().toISOString().slice(0, 10), publishedAt: new Date().toISOString().slice(0, 10) };
    await saveNews([next, ...content.news]);
    setSelectedId(id);
  }

  async function handleDelete(id: string) {
    const next = content.news.filter((item) => item.id !== id);
    setSelectedId(next[0]?.id ?? null);
    await saveNews(next);
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    await saveNews(content.news.map((item) => item.id === draft.id ? draft : item));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
        <button type="button" onClick={() => void handleCreate()} disabled={saving} className="mb-4 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">Ny nyhet</button>
        <div className="space-y-3">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === item.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-stone-900">{item.title || "Utan titel"}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${(item.published ?? true) ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                  {(item.published ?? true) ? "Publik" : "Utkast"}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-500">{item.date || "Saknar datum"}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Nyheter</h2>
              <div className="flex gap-3">
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara"}</button>
                <button type="button" onClick={() => void handleDelete(draft.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Ta bort</button>
              </div>
            </div>

            <input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Titel" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <RichTextEditor
              label="Ingress"
              value={draft.excerpt}
              onChange={(value) => setDraft((current) => current ? { ...current, excerpt: value } : current)}
              placeholder="Skriv ingress med länkar, listor eller enklare formatering"
              minHeightClassName="min-h-[140px]"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input type="date" value={draft.date} onChange={(event) => setDraft((current) => current ? { ...current, date: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3" />
              <input type="date" value={draft.publishedAt ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, publishedAt: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.link} onChange={(event) => setDraft((current) => current ? { ...current, link: event.target.value } : current)} placeholder="Länk" className="rounded-xl border border-stone-300 px-4 py-3" />
              <div className="md:col-span-2">
                <MediaPickerField value={draft.image} onChange={(value) => setDraft((current) => current ? { ...current, image: value } : current)} label="Nyhetsbild" />
              </div>
              <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoTitle: event.target.value } : current)} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoDescription: event.target.value } : current)} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <div className="flex gap-6">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => current ? { ...current, featured: event.target.checked } : current)} /> Utvald</label>
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.published ?? true} onChange={(event) => setDraft((current) => current ? { ...current, published: event.target.checked } : current)} /> Publicerad</label>
            </div>

            {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
          </div>
        ) : <p className="text-sm text-stone-500">Välj en nyhet eller skapa en ny.</p>}
      </section>
    </div>
  );
}
