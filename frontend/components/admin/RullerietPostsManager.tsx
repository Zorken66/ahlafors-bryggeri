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
import { summarizeQualityIssues, validateRullerietPost } from "@/lib/content-quality";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { RullerietPost, SiteContent } from "@/lib/content-schema";
import { getPublishingStatus, getPublishingStatusLabel } from "@/lib/publishing";

type DraftPost = RullerietPost;

const emptyPost: DraftPost = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  publishedAt: "",
  unpublishedAt: "",
  featured: false,
  published: true,
};

function createId() {
  return crypto.randomUUID();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RullerietPostsManager({
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
  const [selectedId, setSelectedId] = useState<string | null>(content.rulleriet.blogPosts[0]?.id ?? null);
  const [draft, setDraft] = useState<DraftPost | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [publishingFilter, setPublishingFilter] = useState<"all" | "published" | "scheduled" | "draft" | "expired">("all");
  const [qualityFilter, setQualityFilter] = useState<"all" | "ready" | "warnings" | "errors">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");

  const posts = useMemo(
    () => [...content.rulleriet.blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [content.rulleriet.blogPosts],
  );
  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const nextPosts = posts.filter((post) => {
      const publishingStatus = getPublishingStatus(post);
      const qualitySummary = summarizeQualityIssues(validateRullerietPost(post));
      const matchesSearch =
        !normalizedSearch ||
        [post.title, post.slug, post.excerpt, post.content]
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

    return nextPosts.sort((left, right) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(left.publishedAt || 0).getTime() - new Date(right.publishedAt || 0).getTime();
        case "title-asc":
          return (left.title || "").localeCompare(right.title || "", "sv");
        case "title-desc":
          return (right.title || "").localeCompare(left.title || "", "sv");
        default:
          return new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime();
      }
    });
  }, [posts, publishingFilter, qualityFilter, searchTerm, sortOrder]);
  const qualityIssues = useMemo(() => draft ? validateRullerietPost(draft) : [], [draft]);

  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selectedPost ? { ...selectedPost } : null);
  }, [selectedPost]);

  useEffect(() => {
    if (focusToken && initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [focusToken, initialSelectedId]);

  useEffect(() => {
    if (filteredPosts.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filteredPosts.some((post) => post.id === selectedId)) {
      setSelectedId(filteredPosts[0].id);
    }
  }, [filteredPosts, selectedId]);

  async function updatePosts(nextPosts: RullerietPost[]) {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({
        ...content,
        rulleriet: {
          ...content.rulleriet,
          blogPosts: nextPosts,
        },
      }, {
        sectionKey: "rullerietPosts",
        changeSummary: "Uppdaterade Rulleriet-inlägg",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara inlägget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const id = createId();
    const nextPost: DraftPost = {
      ...emptyPost,
      id,
      publishedAt: new Date().toISOString().slice(0, 10),
    };

    await updatePosts([nextPost, ...content.rulleriet.blogPosts]);
    setSelectedId(id);
  }

  async function handleDelete(id: string) {
    const nextPosts = content.rulleriet.blogPosts.filter((post) => post.id !== id);
    setSelectedId(nextPosts[0]?.id ?? null);
    await updatePosts(nextPosts);
  }

  function handleFieldChange<K extends keyof DraftPost>(field: K, value: DraftPost[K]) {
    if (!draft) {
      return;
    }

    setStatus(null);
    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const nextPost = { ...currentDraft, [field]: value };

      if (field === "title" && (!currentDraft.slug || currentDraft.slug === slugify(currentDraft.title))) {
        nextPost.slug = slugify(String(value));
      }

      return nextPost;
    });
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    const nextPosts = content.rulleriet.blogPosts.map((post) => (
      post.id === draft.id ? draft : post
    ));

    await updatePosts(nextPosts);
  }

  async function autoSaveImage(nextValue: string) {
    if (!draft) {
      return;
    }

    const nextDraft = { ...draft, image: nextValue };
    setDraft(nextDraft);
    const nextPosts = content.rulleriet.blogPosts.map((post) => post.id === nextDraft.id ? nextDraft : post);
    await updatePosts(nextPosts);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Rulleriet-inlägg</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Skapa och publicera blogginlägg som visas på Rulleriet-sidan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
          >
            Nytt inlägg
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
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
            totalCount={posts.length}
            visibleCount={filteredPosts.length}
          />
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const publishingStatus = getPublishingStatus(post);

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedId(post.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === post.id
                      ? "border-amber-700 bg-amber-50"
                      : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="line-clamp-2 font-semibold text-stone-900">{post.title || "Utan titel"}</span>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <QualityStatusBadge issues={validateRullerietPost(post)} />
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
                  <p className="mt-2 text-xs text-stone-500">{post.publishedAt || "Saknar datum"}</p>
                </button>
              );
            })}
            {posts.length === 0 && <p className="text-sm text-stone-500">Inga inlägg ännu.</p>}
            {posts.length > 0 && filteredPosts.length === 0 ? <p className="text-sm text-stone-500">Inga inlägg matchar aktuella filter.</p> : null}
          </div>
        </aside>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          {selectedPost ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-stone-900">Redigera inlägg</h3>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/rulleriet/${draft?.slug || slugify(draft?.title || "")}?preview=1`}
                    target="_blank"
                    className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                  >
                    Förhandsvisa
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || !draft}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
                  >
                    {saving ? "Sparar..." : "Spara inlägg"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedPost.id)}
                    disabled={saving}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Ta bort
                  </button>
                </div>
              </div>

              <QualityChecklist title="Inläggskvalitet" issues={qualityIssues} />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">Titel</span>
                <input
                  type="text"
                  value={draft?.title ?? ""}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                />
                <FieldIssueHint issues={qualityIssues} field="title" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">Slug</span>
                  <input
                    type="text"
                    value={draft?.slug ?? ""}
                    onChange={(event) => handleFieldChange("slug", slugify(event.target.value))}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                  <FieldIssueHint issues={qualityIssues} field="slug" />
                </label>
              </div>

              <MediaPickerField
                label="Inläggsbild"
                value={draft?.image ?? ""}
                onChange={(value) => handleFieldChange("image", value)}
                fieldId="image"
                activeFocusField={initialFocusField}
                focusToken={focusToken}
                onAutoCommit={autoSaveImage}
              />
              <FieldIssueHint issues={qualityIssues} field="image" />

              <RichTextEditor
                label="Ingress"
                value={draft?.excerpt ?? ""}
                onChange={(value) => handleFieldChange("excerpt", value)}
                placeholder="Skriv en ingress med länkar eller enklare formatering"
                minHeightClassName="min-h-[140px]"
              />
              <FieldIssueHint issues={qualityIssues} field="excerpt" />

              <RichTextEditor
                label="Innehåll"
                value={draft?.content ?? ""}
                onChange={(value) => handleFieldChange("content", value)}
                placeholder="Skriv hela inlägget här"
                minHeightClassName="min-h-[320px]"
                helperText="Du kan lägga till länkar, listor, rubriker och citat."
              />
              <FieldIssueHint issues={qualityIssues} field="content" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-titel</span>
                  <input
                    type="text"
                    value={draft?.seoTitle ?? ""}
                    onChange={(event) => handleFieldChange("seoTitle", event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                  <FieldIssueHint issues={qualityIssues} field="seoTitle" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-beskrivning</span>
                  <input
                    type="text"
                    value={draft?.seoDescription ?? ""}
                    onChange={(event) => handleFieldChange("seoDescription", event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                  <FieldIssueHint issues={qualityIssues} field="seoDescription" />
                </label>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={draft?.featured ?? false}
                    onChange={(event) => handleFieldChange("featured", event.target.checked)}
                  />
                  Utvald
                </label>
              </div>

              <PublishingFields
                value={draft ?? emptyPost}
                qualityIssues={qualityIssues}
                onChange={(nextValue) => {
                  handleFieldChange("published", nextValue.published ?? true);
                  handleFieldChange("publishedAt", nextValue.publishedAt ?? "");
                  handleFieldChange("unpublishedAt", nextValue.unpublishedAt ?? "");
                }}
              />
              <FieldIssueHint issues={qualityIssues} field="publishedAt" />

              {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}

              <div className="sticky bottom-4 z-30 pt-2">
                <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white/95 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900">Rulleriet-inlägg</p>
                    <p className="text-xs text-stone-500">
                      {saving ? "Sparar ändringar..." : status === "Sparat." ? "Inlägget är sparat." : "Spara eller förhandsvisa direkt från nederkanten."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/rulleriet/${draft?.slug || slugify(draft?.title || "")}?preview=1`}
                      target="_blank"
                      className="rounded-xl border border-stone-300 px-4 py-3 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                    >
                      Förhandsvisa
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving || !draft}
                      className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
                    >
                      {saving ? "Sparar..." : "Spara inlägg"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Välj ett inlägg eller skapa ett nytt.</p>
          )}
        </section>
      </div>
    </div>
  );
}
