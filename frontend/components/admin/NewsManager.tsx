"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ContentListFilters from "@/components/admin/ContentListFilters";
import MediaPickerField from "@/components/admin/MediaPickerField";
import FieldIssueHint from "@/components/admin/FieldIssueHint";
import PublishingFields from "@/components/admin/PublishingFields";
import QualityChecklist from "@/components/admin/QualityChecklist";
import QualityStatusBadge from "@/components/admin/QualityStatusBadge";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { summarizeQualityIssues, validateNewsItem } from "@/lib/content-quality";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";
import { getPublishingStatus, getPublishingStatusLabel } from "@/lib/publishing";

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
  unpublishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export default function NewsManager({
  content,
  onSave,
  initialSelectedId,
  initialFocusField,
  focusToken,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
  initialSelectedId?: string;
  initialFocusField?: string;
  focusToken?: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.news[0]?.id ?? null);
  const [draft, setDraft] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [publishingFilter, setPublishingFilter] = useState<"all" | "published" | "scheduled" | "draft" | "expired">("all");
  const [qualityFilter, setQualityFilter] = useState<"all" | "ready" | "warnings" | "errors">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");

  const items = useMemo(() => content.news, [content.news]);
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const nextItems = items.filter((item) => {
      const publishingStatus = getPublishingStatus(item);
      const qualitySummary = summarizeQualityIssues(validateNewsItem(item));
      const matchesSearch =
        !normalizedSearch ||
        [item.title, item.excerpt, item.date, item.link]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesPublishing = publishingFilter === "all" || publishingStatus === publishingFilter;
      const matchesQuality =
        qualityFilter === "all" ||
        (qualityFilter === "ready" && qualitySummary.errors === 0 && qualitySummary.warnings === 0) ||
        (qualityFilter === "warnings" && qualitySummary.warnings > 0) ||
        (qualityFilter === "errors" && qualitySummary.errors > 0);

      return matchesSearch && matchesPublishing && matchesQuality;
    });

    return nextItems.sort((left, right) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(left.date || 0).getTime() - new Date(right.date || 0).getTime();
        case "title-asc":
          return (left.title || "").localeCompare(right.title || "", "sv");
        case "title-desc":
          return (right.title || "").localeCompare(left.title || "", "sv");
        default:
          return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime();
      }
    });
  }, [items, publishingFilter, qualityFilter, searchTerm, sortOrder]);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const qualityIssues = useMemo(() => draft ? validateNewsItem(draft) : [], [draft]);

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  useEffect(() => {
    if (focusToken && initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [focusToken, initialSelectedId]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, selectedId]);

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

  async function autoSaveImage(nextValue: string) {
    if (!draft) {
      return;
    }

    const nextDraft = { ...draft, image: nextValue };
    setDraft(nextDraft);
    await saveNews(content.news.map((item) => item.id === nextDraft.id ? nextDraft : item));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
        <button type="button" onClick={() => void handleCreate()} disabled={saving} className="mb-4 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">Ny nyhet</button>
        <ContentListFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          publishingValue={publishingFilter}
          onPublishingChange={setPublishingFilter}
          qualityValue={qualityFilter}
          onQualityChange={setQualityFilter}
          sortValue={sortOrder}
          onSortChange={(value) => setSortOrder(value as typeof sortOrder)}
          sortOptions={[
            { value: "newest", label: "Sortera: Nyast forst" },
            { value: "oldest", label: "Sortera: Aldst forst" },
            { value: "title-asc", label: "Sortera: Titel A-Ö" },
            { value: "title-desc", label: "Sortera: Titel Ö-A" },
          ]}
          totalCount={items.length}
          visibleCount={filteredItems.length}
        />
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const publishingStatus = getPublishingStatus(item);

            return (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === item.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-stone-900">{item.title || "Utan titel"}</span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <QualityStatusBadge issues={validateNewsItem(item)} />
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      publishingStatus === "published"
                        ? "bg-green-100 text-green-800"
                        : publishingStatus === "scheduled"
                          ? "bg-sky-100 text-sky-800"
                          : publishingStatus === "expired"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-200 text-stone-700"
                    }`}>
                      {getPublishingStatusLabel(publishingStatus)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-stone-500">{item.date || "Saknar datum"}</p>
              </button>
            );
          })}
          {filteredItems.length === 0 ? <p className="text-sm text-stone-500">Inga nyheter matchar aktuella filter.</p> : null}
        </div>
      </aside>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Nyheter</h2>
              <div className="flex gap-3">
                <Link href={`/?preview=1&newsId=${draft.id}#news-${draft.id}`} target="_blank" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                  Förhandsvisa
                </Link>
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara"}</button>
                <button type="button" onClick={() => void handleDelete(draft.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Ta bort</button>
              </div>
            </div>

            <QualityChecklist title="Nyhetskvalitet" issues={qualityIssues} />

            <div>
              <input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Titel" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
              <FieldIssueHint issues={qualityIssues} field="title" />
            </div>
            <RichTextEditor
              label="Ingress"
              value={draft.excerpt}
              onChange={(value) => setDraft((current) => current ? { ...current, excerpt: value } : current)}
              placeholder="Skriv ingress med länkar, listor eller enklare formatering"
              minHeightClassName="min-h-[140px]"
            />
            <FieldIssueHint issues={qualityIssues} field="excerpt" />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input type="date" value={draft.date} onChange={(event) => setDraft((current) => current ? { ...current, date: event.target.value } : current)} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                <FieldIssueHint issues={qualityIssues} field="date" />
              </div>
              <div>
                <input value={draft.link} onChange={(event) => setDraft((current) => current ? { ...current, link: event.target.value } : current)} placeholder="Länk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                <FieldIssueHint issues={qualityIssues} field="link" />
              </div>
              <div className="md:col-span-2">
                <MediaPickerField value={draft.image} onChange={(value) => setDraft((current) => current ? { ...current, image: value } : current)} label="Nyhetsbild" fieldId="image" activeFocusField={initialFocusField} focusToken={focusToken} onAutoCommit={autoSaveImage} />
                <FieldIssueHint issues={qualityIssues} field="image" />
              </div>
              <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoTitle: event.target.value } : current)} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoDescription: event.target.value } : current)} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <div className="flex gap-6">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => current ? { ...current, featured: event.target.checked } : current)} /> Utvald</label>
            </div>

            <PublishingFields
              value={draft}
              qualityIssues={qualityIssues}
              onChange={(nextValue) => setDraft((current) => current ? {
                ...current,
                published: nextValue.published,
                publishedAt: nextValue.publishedAt ?? "",
                unpublishedAt: nextValue.unpublishedAt ?? "",
              } : current)}
            />

            {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
          </div>
        ) : <p className="text-sm text-stone-500">Välj en nyhet eller skapa en ny.</p>}
      </section>
    </div>
  );
}
