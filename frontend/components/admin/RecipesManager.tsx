"use client";

import { useEffect, useMemo, useState } from "react";

import MediaPickerField from "@/components/admin/MediaPickerField";
import HeroOverlayField from "@/components/admin/HeroOverlayField";
import SectionTabs from "@/components/admin/SectionTabs";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { SiteContent } from "@/lib/content-schema";

type Recipe = SiteContent["recipes"][number];

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

const emptyRecipe: Recipe = {
  id: "",
  title: "",
  description: "",
  ingredients: [],
  instructions: [],
  difficulty: "",
  time: "",
  servings: "",
  pairing: "",
  image: "",
  published: true,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export default function RecipesManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.recipes[0]?.id ?? null);
  const [draft, setDraft] = useState<Recipe | null>(null);
  const [pageDraft, setPageDraft] = useState({ ...content.recipesPage });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"page" | "recipes">("page");

  const recipes = useMemo(() => content.recipes, [content.recipes]);
  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  useEffect(() => {
    setPageDraft({ ...content.recipesPage });
  }, [content.recipesPage]);

  async function saveRecipes(nextRecipes: SiteContent["recipes"]) {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, recipes: nextRecipes }, {
        sectionKey: "recipes",
        changeSummary: "Uppdaterade recept",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara recept.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const id = crypto.randomUUID();
    const next = { ...emptyRecipe, id, publishedAt: new Date().toISOString().slice(0, 10) };
    await saveRecipes([next, ...content.recipes]);
    setSelectedId(id);
  }

  async function handleDelete(id: string) {
    const next = content.recipes.filter((recipe) => recipe.id !== id);
    setSelectedId(next[0]?.id ?? null);
    await saveRecipes(next);
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    await saveRecipes(content.recipes.map((recipe) => recipe.id === draft.id ? draft : recipe));
  }

  async function handleSavePage() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, recipesPage: pageDraft }, {
        sectionKey: "recipesPage",
        changeSummary: "Uppdaterade receptsidans inställningar",
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
          { id: "recipes", label: "Recept" },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as "page" | "recipes")}
      />

      {activeTab === "page" ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Receptsida</h2>
              <p className="mt-1 text-sm text-stone-600">Hero, intro, CTA och SEO för receptsidan.</p>
            </div>
            <button type="button" onClick={() => void handleSavePage()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara sidinställningar"}</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input value={pageDraft.heroTitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroTitle: event.target.value }))} placeholder="Hero-rubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
            <input value={pageDraft.heroSubtitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroSubtitle: event.target.value }))} placeholder="Hero-underrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <MediaPickerField value={pageDraft.heroImage} onChange={(value) => setPageDraft((current) => ({ ...current, heroImage: value }))} label="Hero-bild" />
          <HeroOverlayField label="Hero-overlay" value={pageDraft.heroOverlayOpacity} onChange={(value) => setPageDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
          <div className="grid gap-4">
            <input value={pageDraft.introTitle} onChange={(event) => setPageDraft((current) => ({ ...current, introTitle: event.target.value }))} placeholder="Intro-rubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={pageDraft.introSubtext} onChange={(event) => setPageDraft((current) => ({ ...current, introSubtext: event.target.value }))} rows={3} placeholder="Introtext" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </div>
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
        <button type="button" onClick={() => void handleCreate()} disabled={saving} className="mb-4 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">Nytt recept</button>
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <button key={recipe.id} type="button" onClick={() => setSelectedId(recipe.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === recipe.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-stone-900">{recipe.title || "Utan titel"}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${(recipe.published ?? true) ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                  {(recipe.published ?? true) ? "Publikt" : "Utkast"}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-500">{recipe.difficulty || "Ingen svårighet"}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Recept</h2>
              <div className="flex gap-3">
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara"}</button>
                <button type="button" onClick={() => void handleDelete(draft.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Ta bort</button>
              </div>
            </div>

            <input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Titel" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} placeholder="Beskrivning" rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.difficulty} onChange={(event) => setDraft((current) => current ? { ...current, difficulty: event.target.value } : current)} placeholder="Svårighetsgrad" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.time} onChange={(event) => setDraft((current) => current ? { ...current, time: event.target.value } : current)} placeholder="Tid" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.servings} onChange={(event) => setDraft((current) => current ? { ...current, servings: event.target.value } : current)} placeholder="Portioner" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.pairing} onChange={(event) => setDraft((current) => current ? { ...current, pairing: event.target.value } : current)} placeholder="Passar med" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input type="date" value={draft.publishedAt ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, publishedAt: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3" />
              <div className="md:col-span-2">
                <MediaPickerField value={draft.image} onChange={(value) => setDraft((current) => current ? { ...current, image: value } : current)} label="Receptbild" />
              </div>
              <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoTitle: event.target.value } : current)} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoDescription: event.target.value } : current)} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>
            <textarea value={draft.ingredients.join("\n")} onChange={(event) => setDraft((current) => current ? { ...current, ingredients: splitLines(event.target.value) } : current)} placeholder="Ingredienser, en per rad" rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={draft.instructions.join("\n")} onChange={(event) => setDraft((current) => current ? { ...current, instructions: splitLines(event.target.value) } : current)} placeholder="Instruktioner, en per rad" rows={8} className="w-full rounded-xl border border-stone-300 px-4 py-3" />

            <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.published ?? true} onChange={(event) => setDraft((current) => current ? { ...current, published: event.target.checked } : current)} /> Publicerad</label>

            {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
          </div>
        ) : <p className="text-sm text-stone-500">Välj ett recept eller skapa ett nytt.</p>}
      </section>
    </div>
      )}
    </div>
  );
}
