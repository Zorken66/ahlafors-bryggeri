"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import HeroOverlayField from "@/components/admin/HeroOverlayField";
import MediaPickerField from "@/components/admin/MediaPickerField";
import SectionTabs from "@/components/admin/SectionTabs";
import type { ProductEntry, ProductLink, SiteContent } from "@/lib/content-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import { getProductCategories, slugifyProduct } from "@/lib/product-utils";

type Product = ProductEntry;

const emptyProduct: Product = {
  id: "",
  name: "",
  slug: "",
  type: "",
  description: "",
  fullDescription: "",
  style: "",
  alcohol: "",
  volume: "",
  systembolaget: "",
  artikelnummer: "",
  image: "",
  category: "",
  featured: false,
  published: true,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  links: [],
  ogImage: "",
  relatedProductIds: [],
};

const defaultProductLink: ProductLink = {
  label: "",
  url: "",
};

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function ProductsManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(content.products[0]?.id ?? null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [pageDraft, setPageDraft] = useState({ ...content.productsPage });
  const [detailPageDraft, setDetailPageDraft] = useState({ ...content.productDetailPage });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"page" | "settings" | "products">("page");
  const [settingsDraft, setSettingsDraft] = useState({
    productCategories: content.site.productCategories ?? getProductCategories(content.site, content.products),
    featuredProductIds: content.site.featuredProductIds ?? content.products.filter((product) => product.featured).map((product) => product.id),
  });

  const products = useMemo(() => content.products, [content.products]);
  const selected = products.find((product) => product.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
  }, [selected]);

  useEffect(() => {
    setSettingsDraft({
      productCategories: content.site.productCategories ?? getProductCategories(content.site, content.products),
      featuredProductIds: content.site.featuredProductIds ?? content.products.filter((product) => product.featured).map((product) => product.id),
    });
  }, [content.site, content.products]);

  useEffect(() => {
    setPageDraft({ ...content.productsPage });
  }, [content.productsPage]);

  useEffect(() => {
    setDetailPageDraft({ ...content.productDetailPage });
  }, [content.productDetailPage]);

  async function saveProducts(nextProducts: SiteContent["products"]) {
    setSaving(true);
    setStatus(null);
    try {
      await onSave({ ...content, products: nextProducts }, {
        sectionKey: "products",
        changeSummary: "Uppdaterade produkter",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara produkter.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const id = crypto.randomUUID();
    const next = { ...emptyProduct, id, publishedAt: new Date().toISOString().slice(0, 10) };
    await saveProducts([next, ...content.products]);
    setSelectedId(id);
  }

  async function handleDelete(id: string) {
    const nextProducts = content.products.filter((product) => product.id !== id);
    setSelectedId(nextProducts[0]?.id ?? null);
    await saveProducts(nextProducts);
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    await saveProducts(content.products.map((product) => product.id === draft.id ? {
      ...draft,
      links: (draft.links ?? []).map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      })).filter((link) => link.label && link.url),
    } : product));
  }

  async function handleSaveSettings() {
    setSaving(true);
    setStatus(null);

    try {
      const cleanedCategories = settingsDraft.productCategories
        .map((category) => ({
          id: slugifyProduct(category.id),
          name: category.name.trim(),
          icon: category.icon?.trim() || undefined,
        }))
        .filter((category) => category.id && category.name);

      await onSave({
        ...content,
        site: {
          ...content.site,
          productCategories: [{ id: "alla", name: "Alla", icon: "🍺" }, ...cleanedCategories.filter((category) => category.id !== "alla")],
          featuredProductIds: settingsDraft.featuredProductIds,
        },
      }, {
        sectionKey: "products",
        changeSummary: "Uppdaterade produktkategorier och startsidans produktblock",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara produktinställningarna.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePage() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({ ...content, productsPage: pageDraft, productDetailPage: detailPageDraft }, {
        sectionKey: "products",
        changeSummary: "Uppdaterade produktsidans och produktdetaljens inställningar",
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
          { id: "settings", label: "Sidinställningar" },
          { id: "products", label: "Produkter" },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as "page" | "settings" | "products")}
      />

      {activeTab === "page" ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Produktsida</h2>
              <p className="mt-1 text-sm text-stone-600">Hero, CTA och SEO för produktsidan.</p>
            </div>
            <button type="button" onClick={() => void handleSavePage()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
              {saving ? "Sparar..." : "Spara sidinställningar"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input value={pageDraft.heroTitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroTitle: event.target.value }))} placeholder="Hero-rubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
            <input value={pageDraft.heroSubtitle} onChange={(event) => setPageDraft((current) => ({ ...current, heroSubtitle: event.target.value }))} placeholder="Hero-underrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <MediaPickerField value={pageDraft.heroImage} onChange={(value) => setPageDraft((current) => ({ ...current, heroImage: value }))} label="Hero-bild" />
          <HeroOverlayField label="Hero-overlay" value={pageDraft.heroOverlayOpacity} onChange={(value) => setPageDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
          <textarea value={pageDraft.heroHighlights.join("\n")} onChange={(event) => setPageDraft((current) => ({ ...current, heroHighlights: splitLines(event.target.value) }))} rows={4} placeholder="Hero-punkter, en per rad" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={pageDraft.seoTitle ?? ""} onChange={(event) => setPageDraft((current) => ({ ...current, seoTitle: event.target.value }))} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
            <input value={pageDraft.seoDescription ?? ""} onChange={(event) => setPageDraft((current) => ({ ...current, seoDescription: event.target.value }))} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
          </div>
          <textarea value={pageDraft.emptyStateText} onChange={(event) => setPageDraft((current) => ({ ...current, emptyStateText: event.target.value }))} rows={2} placeholder="Text om ingen produkt hittas" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
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

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-900">Produktdetaljsida</h3>
            <p className="mt-1 text-sm text-stone-600">Hero-overlay och redaktionella etiketter för varje enskild produktsida.</p>

            <div className="mt-4 space-y-4">
              <HeroOverlayField label="Hero-overlay" value={detailPageDraft.heroOverlayOpacity} onChange={(value) => setDetailPageDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <input value={detailPageDraft.backLinkLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, backLinkLabel: event.target.value }))} placeholder="Tillbaka-länk" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.descriptionHeading} onChange={(event) => setDetailPageDraft((current) => ({ ...current, descriptionHeading: event.target.value }))} placeholder="Rubrik för beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.linksHeading} onChange={(event) => setDetailPageDraft((current) => ({ ...current, linksHeading: event.target.value }))} placeholder="Rubrik för länkar" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.dataHeading} onChange={(event) => setDetailPageDraft((current) => ({ ...current, dataHeading: event.target.value }))} placeholder="Rubrik för produktdata" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.linkActionLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, linkActionLabel: event.target.value }))} placeholder="Knapptext för länk" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.linksEmptyText} onChange={(event) => setDetailPageDraft((current) => ({ ...current, linksEmptyText: event.target.value }))} placeholder="Tom-läge för länkar" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.articleNumberLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, articleNumberLabel: event.target.value }))} placeholder="Etikett för artikelnummer" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.publishedLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, publishedLabel: event.target.value }))} placeholder="Etikett för publicerad" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.relatedCountLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, relatedCountLabel: event.target.value }))} placeholder="Etikett för liknande produkter" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.relatedEyebrow} onChange={(event) => setDetailPageDraft((current) => ({ ...current, relatedEyebrow: event.target.value }))} placeholder="Ögonbryn för relaterat block" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.relatedTitle} onChange={(event) => setDetailPageDraft((current) => ({ ...current, relatedTitle: event.target.value }))} placeholder="Rubrik för relaterat block" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.allProductsLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, allProductsLabel: event.target.value }))} placeholder="Länktext till alla produkter" className="rounded-xl border border-stone-300 px-4 py-3" />
                <input value={detailPageDraft.viewProductLabel} onChange={(event) => setDetailPageDraft((current) => ({ ...current, viewProductLabel: event.target.value }))} placeholder="Knapptext för relaterad produkt" className="rounded-xl border border-stone-300 px-4 py-3" />
              </div>
            </div>
          </div>
        </section>
      ) : activeTab === "settings" ? (
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Produktinställningar</h2>
              <p className="mt-1 text-sm text-stone-600">Kategorier och vilka produkter som ska lyftas på startsidan.</p>
            </div>
            <button type="button" onClick={() => void handleSaveSettings()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
              {saving ? "Sparar..." : "Spara inställningar"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              {settingsDraft.productCategories.map((category, index) => (
                <div key={`${category.id}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1.3fr_120px_auto]">
                  <input
                    value={category.id}
                    onChange={(event) => setSettingsDraft((current) => ({
                      ...current,
                      productCategories: current.productCategories.map((entry, entryIndex) => entryIndex === index ? { ...entry, id: event.target.value } : entry),
                    }))}
                    placeholder="kategori-id"
                    disabled={category.id === "alla"}
                    className="rounded-xl border border-stone-300 px-4 py-3"
                  />
                  <input
                    value={category.name}
                    onChange={(event) => setSettingsDraft((current) => ({
                      ...current,
                      productCategories: current.productCategories.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry),
                    }))}
                    placeholder="Kategorinamn"
                    className="rounded-xl border border-stone-300 px-4 py-3"
                  />
                  <input
                    value={category.icon ?? ""}
                    onChange={(event) => setSettingsDraft((current) => ({
                      ...current,
                      productCategories: current.productCategories.map((entry, entryIndex) => entryIndex === index ? { ...entry, icon: event.target.value } : entry),
                    }))}
                    placeholder="Ikon"
                    className="rounded-xl border border-stone-300 px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setSettingsDraft((current) => ({
                      ...current,
                      productCategories: current.productCategories.filter((_, entryIndex) => entryIndex !== index),
                    }))}
                    disabled={category.id === "alla"}
                    className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-50"
                  >
                    Ta bort
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSettingsDraft((current) => ({
                  ...current,
                  productCategories: [...current.productCategories, { id: "", name: "", icon: "" }],
                }))}
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700"
              >
                Ny kategori
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-sm font-semibold text-stone-900">Produktblock på startsidan</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {products.map((product) => (
                  <label key={`featured-${product.id}`} className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={settingsDraft.featuredProductIds.includes(product.id)}
                      onChange={(event) => setSettingsDraft((current) => ({
                        ...current,
                        featuredProductIds: event.target.checked
                          ? [...current.featuredProductIds, product.id]
                          : current.featuredProductIds.filter((id) => id !== product.id),
                      }))}
                    />
                    {product.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
          <button type="button" onClick={() => void handleCreate()} disabled={saving} className="mb-4 w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">
            Ny produkt
          </button>
          <div className="space-y-3">
            {products.map((product) => (
              <button key={product.id} type="button" onClick={() => setSelectedId(product.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === product.id ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-stone-900">{product.name || "Utan namn"}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${(product.published ?? true) ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                    {(product.published ?? true) ? "Publik" : "Utkast"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-500">{product.category || "Ingen kategori"}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
        {draft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Produkter</h2>
              <div className="flex gap-3">
                <Link href={`/produkter/${draft.slug || slugifyProduct(draft.name)}?preview=1`} target="_blank" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">
                  Förhandsvisa
                </Link>
                <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white">{saving ? "Sparar..." : "Spara"}</button>
                <button type="button" onClick={() => void handleDelete(draft.id)} disabled={saving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Ta bort</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.name} onChange={(event) => setDraft((current) => current ? { ...current, name: event.target.value } : current)} placeholder="Namn" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input
                value={draft.slug ?? ""}
                onChange={(event) => setDraft((current) => current ? { ...current, slug: slugifyProduct(event.target.value) } : current)}
                placeholder="Slug"
                className="rounded-xl border border-stone-300 px-4 py-3"
              />
              <select value={draft.category} onChange={(event) => setDraft((current) => current ? { ...current, category: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3">
                {settingsDraft.productCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input value={draft.type} onChange={(event) => setDraft((current) => current ? { ...current, type: event.target.value } : current)} placeholder="Typ" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.style} onChange={(event) => setDraft((current) => current ? { ...current, style: event.target.value } : current)} placeholder="Stil" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.alcohol} onChange={(event) => setDraft((current) => current ? { ...current, alcohol: event.target.value } : current)} placeholder="Alkohol" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.volume} onChange={(event) => setDraft((current) => current ? { ...current, volume: event.target.value } : current)} placeholder="Volym" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <MediaPickerField value={draft.image} onChange={(value) => setDraft((current) => current ? { ...current, image: value } : current)} label="Produktbild" />
            <MediaPickerField value={draft.ogImage ?? ""} onChange={(value) => setDraft((current) => current ? { ...current, ogImage: value } : current)} label="Open Graph-bild" />
            <input value={draft.systembolaget} onChange={(event) => setDraft((current) => current ? { ...current, systembolaget: event.target.value } : current)} placeholder="Systembolaget-länk" className="w-full rounded-xl border border-stone-300 px-4 py-3" />

            <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Produktlänkar</h3>
                  <p className="text-xs text-stone-500">Lägg till köp-, återförsäljar- eller kampanjlänkar.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft((current) => current ? { ...current, links: [...(current.links ?? []), { ...defaultProductLink }] } : current)}
                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700"
                >
                  Ny länk
                </button>
              </div>

              {(draft.links ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(draft.links ?? []).map((link, index) => (
                    <div key={`${draft.id}-link-${index}`} className="grid gap-3 md:grid-cols-[1fr_1.6fr_auto]">
                      <input
                        value={link.label}
                        onChange={(event) => setDraft((current) => current ? {
                          ...current,
                          links: (current.links ?? []).map((entry, entryIndex) => entryIndex === index ? { ...entry, label: event.target.value } : entry),
                        } : current)}
                        placeholder="Knapptext"
                        className="rounded-xl border border-stone-300 px-4 py-3"
                      />
                      <input
                        value={link.url}
                        onChange={(event) => setDraft((current) => current ? {
                          ...current,
                          links: (current.links ?? []).map((entry, entryIndex) => entryIndex === index ? { ...entry, url: event.target.value } : entry),
                        } : current)}
                        placeholder="https://..."
                        className="rounded-xl border border-stone-300 px-4 py-3"
                      />
                      <button
                        type="button"
                        onClick={() => setDraft((current) => current ? {
                          ...current,
                          links: (current.links ?? []).filter((_, entryIndex) => entryIndex !== index),
                        } : current)}
                        className="rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700"
                      >
                        Ta bort
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">Inga extra länkar ännu.</p>
              )}
            </div>
            <textarea value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} placeholder="Kort beskrivning" rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            <textarea value={draft.fullDescription} onChange={(event) => setDraft((current) => current ? { ...current, fullDescription: event.target.value } : current)} placeholder="Full beskrivning" rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-sm font-semibold text-stone-900">Relaterade produkter</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {products.filter((product) => product.id !== draft.id).map((product) => (
                  <label key={`related-${product.id}`} className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={(draft.relatedProductIds ?? []).includes(product.id)}
                      onChange={(event) => setDraft((current) => current ? {
                        ...current,
                        relatedProductIds: event.target.checked
                          ? [...(current.relatedProductIds ?? []), product.id]
                          : (current.relatedProductIds ?? []).filter((id) => id !== product.id),
                      } : current)}
                    />
                    {product.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoTitle: event.target.value } : current)} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, seoDescription: event.target.value } : current)} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
              <input type="date" value={draft.publishedAt ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, publishedAt: event.target.value } : current)} className="rounded-xl border border-stone-300 px-4 py-3" />
              <input value={draft.artikelnummer ?? ""} onChange={(event) => setDraft((current) => current ? { ...current, artikelnummer: event.target.value } : current)} placeholder="Artikelnummer" className="rounded-xl border border-stone-300 px-4 py-3" />
            </div>

            <div className="flex gap-6">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => current ? { ...current, featured: event.target.checked } : current)} /> Utvald</label>
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700"><input type="checkbox" checked={draft.published ?? true} onChange={(event) => setDraft((current) => current ? { ...current, published: event.target.checked } : current)} /> Publicerad</label>
            </div>

            {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
          </div>
        ) : <p className="text-sm text-stone-500">Välj en produkt eller skapa en ny.</p>}
        </section>
      </div>
      )}
    </div>
  );
}
