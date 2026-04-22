"use client";

import { useEffect, useMemo, useState } from "react";

import MediaPickerField from "@/components/admin/MediaPickerField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { RullerietPost, SiteContent } from "@/lib/content-schema";

type DraftPost = RullerietPost;

const emptyPost: DraftPost = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  publishedAt: "",
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
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.rulleriet.blogPosts[0]?.id ?? null);
  const [draft, setDraft] = useState<DraftPost | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const posts = useMemo(
    () => [...content.rulleriet.blogPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [content.rulleriet.blogPosts],
  );

  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selectedPost ? { ...selectedPost } : null);
  }, [selectedPost]);

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
          <div className="space-y-3">
            {posts.map((post) => (
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
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${post.published ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                    {post.published ? "Publik" : "Utkast"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-500">{post.publishedAt || "Saknar datum"}</p>
              </button>
            ))}
            {posts.length === 0 && <p className="text-sm text-stone-500">Inga inlägg ännu.</p>}
          </div>
        </aside>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          {selectedPost ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-stone-900">Redigera inlägg</h3>
                <div className="flex items-center gap-3">
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

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">Titel</span>
                <input
                  type="text"
                  value={draft?.title ?? ""}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                />
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
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">Publiceringsdatum</span>
                  <input
                    type="date"
                    value={draft?.publishedAt ?? ""}
                    onChange={(event) => handleFieldChange("publishedAt", event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                </label>
              </div>

              <MediaPickerField
                label="Inläggsbild"
                value={draft?.image ?? ""}
                onChange={(value) => handleFieldChange("image", value)}
              />

              <RichTextEditor
                label="Ingress"
                value={draft?.excerpt ?? ""}
                onChange={(value) => handleFieldChange("excerpt", value)}
                placeholder="Skriv en ingress med länkar eller enklare formatering"
                minHeightClassName="min-h-[140px]"
              />

              <RichTextEditor
                label="Innehåll"
                value={draft?.content ?? ""}
                onChange={(value) => handleFieldChange("content", value)}
                placeholder="Skriv hela inlägget här"
                minHeightClassName="min-h-[320px]"
                helperText="Du kan lägga till länkar, listor, rubriker och citat."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-titel</span>
                  <input
                    type="text"
                    value={draft?.seoTitle ?? ""}
                    onChange={(event) => handleFieldChange("seoTitle", event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">SEO-beskrivning</span>
                  <input
                    type="text"
                    value={draft?.seoDescription ?? ""}
                    onChange={(event) => handleFieldChange("seoDescription", event.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-600"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={draft?.published ?? false}
                    onChange={(event) => handleFieldChange("published", event.target.checked)}
                  />
                  Publicerad
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={draft?.featured ?? false}
                    onChange={(event) => handleFieldChange("featured", event.target.checked)}
                  />
                  Utvald
                </label>
              </div>

              {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
            </div>
          ) : (
            <p className="text-sm text-stone-500">Välj ett inlägg eller skapa ett nytt.</p>
          )}
        </section>
      </div>
    </div>
  );
}
