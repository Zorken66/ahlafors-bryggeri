"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import MediaCropDialog from "@/components/admin/MediaCropDialog";
import type { CmsMediaAsset } from "@/lib/cms-media-schema";
import type { CmsManagedSection } from "@/lib/cms-permissions";

type MediaLibraryFocus = {
  section: CmsManagedSection;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  targetField?: string;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} kB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUsageLabel(count: number | undefined) {
  if (!count) {
    return "Oanvand";
  }

  return count === 1 ? "Anvands pa 1 stalle" : `Anvands pa ${count} stallen`;
}

async function parseApiResponse<T>(response: Response): Promise<T | { error?: string }> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await response.json() as T | { error?: string };
  }

  const text = await response.text();
  return { error: text || "Servern svarade inte med JSON." };
}

export default function MediaLibraryManager({
  onOpenSection,
  initialAssetId,
  focusToken,
}: {
  onOpenSection?: (focus: MediaLibraryFocus) => void;
  initialAssetId?: string;
  focusToken?: number;
}) {
  const [assets, setAssets] = useState<CmsMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropAsset, setCropAsset] = useState<CmsMediaAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all");
  const [altFilter, setAltFilter] = useState<"all" | "missing" | "present">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name-asc" | "name-desc" | "largest" | "most-used">("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionRunning, setBulkActionRunning] = useState(false);
  const focusedAssetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cms/media", { cache: "no-store" });
        const data = await parseApiResponse<CmsMediaAsset[]>(response);

        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Kunde inte läsa mediebiblioteket.");
        }

        if (!cancelled) {
          setAssets(data as CmsMediaAsset[]);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Kunde inte läsa mediebiblioteket.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAssets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialAssetId || !focusToken || !focusedAssetRef.current) {
      return;
    }

    focusedAssetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [focusToken, initialAssetId, assets]);

  const visibleAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = assets.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        [asset.displayName, asset.originalName, asset.publicUrl, asset.altText, asset.uploadedBy]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesUsage =
        usageFilter === "all" ||
        (usageFilter === "used" && (asset.usageCount ?? 0) > 0) ||
        (usageFilter === "unused" && (asset.usageCount ?? 0) === 0);
      const hasAltText = Boolean(asset.altText?.trim());
      const matchesAlt =
        altFilter === "all" ||
        (altFilter === "missing" && !hasAltText) ||
        (altFilter === "present" && hasAltText);

      return matchesSearch && matchesUsage && matchesAlt;
    });

    return filtered.sort((left, right) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        case "name-asc":
          return left.displayName.localeCompare(right.displayName, "sv");
        case "name-desc":
          return right.displayName.localeCompare(left.displayName, "sv");
        case "largest":
          return right.sizeBytes - left.sizeBytes;
        case "most-used":
          return (right.usageCount ?? 0) - (left.usageCount ?? 0);
        default:
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
    });
  }, [altFilter, assets, searchTerm, sortOrder, usageFilter]);

  const hasActiveFilters = searchTerm.trim() || usageFilter !== "all" || altFilter !== "all" || sortOrder !== "newest";
  const selectedAssets = visibleAssets.filter((asset) => selectedIds.includes(asset.id));
  const selectedMissingAltAssets = selectedAssets.filter((asset) => !(asset.altText ?? "").trim());
  const selectedUnusedAssets = selectedAssets.filter((asset) => (asset.usageCount ?? 0) === 0);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => assets.some((asset) => asset.id === id)));
  }, [assets]);

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  }

  function toggleSelectVisible() {
    const visibleIds = visibleAssets.map((asset) => asset.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  async function handleBulkAltTextFromName() {
    if (selectedMissingAltAssets.length === 0) {
      return;
    }

    setError(null);
    setStatus(null);
    setBulkActionRunning(true);

    try {
      for (const asset of selectedMissingAltAssets) {
        const response = await fetch(`/api/cms/media/${asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ altText: asset.displayName }),
        });

        const data = await parseApiResponse<CmsMediaAsset>(response);

        if (!response.ok) {
          throw new Error("error" in data ? data.error : `Kunde inte uppdatera ${asset.displayName}.`);
        }

        setAssets((current) => current.map((entry) => entry.id === asset.id ? data as CmsMediaAsset : entry));
      }

      setStatus(`Alt-text sattes for ${selectedMissingAltAssets.length} bilder.`);
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : "Kunde inte uppdatera alt-text i batch.");
    } finally {
      setBulkActionRunning(false);
    }
  }

  async function handleBulkDeleteUnused() {
    if (selectedUnusedAssets.length === 0) {
      return;
    }

    setError(null);
    setStatus(null);
    setBulkActionRunning(true);

    try {
      for (const asset of selectedUnusedAssets) {
        const response = await fetch(`/api/cms/media/${asset.id}`, {
          method: "DELETE",
        });
        const data = await parseApiResponse<{ error?: string }>(response);

        if (!response.ok) {
          throw new Error(data.error ?? `Kunde inte ta bort ${asset.displayName}.`);
        }

        setAssets((current) => current.filter((entry) => entry.id !== asset.id));
        setSelectedIds((current) => current.filter((id) => id !== asset.id));
      }

      setStatus(`${selectedUnusedAssets.length} oanvanda bilder togs bort.`);
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : "Kunde inte ta bort bilder i batch.");
    } finally {
      setBulkActionRunning(false);
    }
  }

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });

      const data = await parseApiResponse<CmsMediaAsset>(response);

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Kunde inte ladda upp bilden.");
      }

      setAssets((current) => [data as CmsMediaAsset, ...current]);
      setStatus("Bild uppladdad.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Kunde inte ladda upp bilden.");
    } finally {
      setUploading(false);
    }
  }

  async function handleMetadataSave(id: string, values: { altText?: string; displayName?: string }) {
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await parseApiResponse<CmsMediaAsset>(response);

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Kunde inte uppdatera bilden.");
      }

      setAssets((current) => current.map((asset) => asset.id === id ? data as CmsMediaAsset : asset));
      setStatus("Bildmetadata uppdaterad.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kunde inte uppdatera bilden.");
    }
  }

  async function handleReplace(id: string, file: File | null) {
    if (!file) {
      return;
    }

    setError(null);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/cms/media/${id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await parseApiResponse<CmsMediaAsset>(response);

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Kunde inte ersätta bilden.");
      }

      setAssets((current) => current.map((asset) => asset.id === id ? data as CmsMediaAsset : asset));
      setStatus("Bilden ersattes utan att URL ändrades.");
    } catch (replaceError) {
      setError(replaceError instanceof Error ? replaceError.message : "Kunde inte ersätta bilden.");
    }
  }

  async function handleCropSave(file: File) {
    if (!cropAsset) {
      return;
    }

    await handleReplace(cropAsset.id, file);
    setCropAsset(null);
  }

  async function handleDelete(id: string) {
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/cms/media/${id}`, {
        method: "DELETE",
      });
      const data = await parseApiResponse<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error ?? "Kunde inte ta bort bilden.");
      }

      setAssets((current) => current.filter((asset) => asset.id !== id));
      setStatus("Bild borttagen.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Kunde inte ta bort bilden.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Mediebibliotek</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Döp filer tydligt, sätt alt-text och ersätt bildinnehåll utan att ändra URL:en.</p>
        </div>
        <label className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800">
          {uploading ? "Laddar upp..." : "Ladda upp bild"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleUpload(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {status && <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{status}</p>}

      {loading ? (
        <p className="text-sm text-stone-500">Läser bilder...</p>
      ) : assets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500 shadow-lg">
          Inga bilder uppladdade ännu.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
            <div className="grid gap-3 lg:grid-cols-2">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Sok pa namn, filnamn, url eller alt-text"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              />
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm"
              >
                <option value="newest">Sortera: Nyast forst</option>
                <option value="oldest">Sortera: Aldst forst</option>
                <option value="name-asc">Sortera: Namn A-Ö</option>
                <option value="name-desc">Sortera: Namn Ö-A</option>
                <option value="largest">Sortera: Storst fil forst</option>
                <option value="most-used">Sortera: Mest anvand forst</option>
              </select>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select
                value={usageFilter}
                onChange={(event) => setUsageFilter(event.target.value as typeof usageFilter)}
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm"
              >
                <option value="all">Alla anvandningslagen</option>
                <option value="used">Anvands i innehall</option>
                <option value="unused">Oanvanda bilder</option>
              </select>
              <select
                value={altFilter}
                onChange={(event) => setAltFilter(event.target.value as typeof altFilter)}
                className="rounded-xl border border-stone-300 px-4 py-3 text-sm"
              >
                <option value="all">All alt-textstatus</option>
                <option value="missing">Saknar alt-text</option>
                <option value="present">Har alt-text</option>
              </select>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-500">
              <span>Visar {visibleAssets.length} av {assets.length}</span>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setUsageFilter("all");
                    setAltFilter("all");
                    setSortOrder("newest");
                  }}
                  className="rounded-full border border-stone-300 px-3 py-1 font-semibold text-stone-700"
                >
                  Rensa filter
                </button>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-3">
              <button
                type="button"
                onClick={toggleSelectVisible}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                {visibleAssets.length > 0 && visibleAssets.every((asset) => selectedIds.includes(asset.id)) ? "Avmarkera synliga" : "Markera synliga"}
              </button>
              <span className="text-xs text-stone-500">
                {selectedIds.length === 0 ? "Inget markerat" : `${selectedIds.length} markerade`}
              </span>
              <button
                type="button"
                onClick={() => void handleBulkAltTextFromName()}
                disabled={bulkActionRunning || selectedMissingAltAssets.length === 0}
                className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 disabled:opacity-50"
              >
                {bulkActionRunning ? "Jobbar..." : `Satt alt-text fran bildnamn (${selectedMissingAltAssets.length})`}
              </button>
              <button
                type="button"
                onClick={() => void handleBulkDeleteUnused()}
                disabled={bulkActionRunning || selectedUnusedAssets.length === 0}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
              >
                {bulkActionRunning ? "Jobbar..." : `Ta bort oanvanda (${selectedUnusedAssets.length})`}
              </button>
            </div>
          </div>

          {visibleAssets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500 shadow-lg">
              Inga bilder matchar aktuella filter.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {visibleAssets.map((asset) => (
            <article
              key={asset.id}
              ref={asset.id === initialAssetId ? focusedAssetRef : null}
              className={`overflow-hidden rounded-3xl border bg-white shadow-lg transition ${
                asset.id === initialAssetId
                  ? "border-amber-400 ring-2 ring-amber-100"
                  : "border-stone-200"
              }`}
            >
              <div className="relative h-64 w-full">
                <Image
                  src={asset.publicUrl}
                  alt={asset.altText ?? ""}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(asset.id)}
                      onChange={() => toggleSelected(asset.id)}
                    />
                    Markera
                  </label>
                  <div className="flex flex-wrap items-center justify-end gap-3 text-xs font-semibold text-stone-500">
                  <span>{asset.displayName}</span>
                  <span>{formatFileSize(asset.sizeBytes)}</span>
                  <span>{new Date(asset.createdAt).toLocaleString("sv-SE")}</span>
                  <span className={`rounded-full px-3 py-1 ${asset.usageCount ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                    {formatUsageLabel(asset.usageCount)}
                  </span>
                  {asset.id === initialAssetId && (
                    <span className="rounded-full bg-amber-700 px-3 py-1 text-white">
                      Aktiv uppgift
                    </span>
                  )}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">Bildnamn</span>
                  <input
                    type="text"
                    defaultValue={asset.displayName}
                    onBlur={(event) => {
                      const nextValue = event.target.value.trim();
                      if (nextValue && nextValue !== asset.displayName) {
                        void handleMetadataSave(asset.id, { displayName: nextValue });
                      }
                    }}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-stone-700">Alt-text</span>
                  <input
                    type="text"
                    defaultValue={asset.altText ?? ""}
                    onBlur={(event) => {
                      const nextValue = event.target.value;
                      if (nextValue !== (asset.altText ?? "")) {
                        void handleMetadataSave(asset.id, { altText: nextValue });
                      }
                    }}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <code className="rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-700">{asset.publicUrl}</code>
                  <div className="flex flex-wrap gap-3">
                    <label className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500">
                      Ersätt fil
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          void handleReplace(asset.id, event.target.files?.[0] ?? null);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCropAsset(asset)}
                      className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                    >
                      Beskär
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(asset.id)}
                      className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
                {asset.usageCount ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Bilden används i innehållet.</p>
                    <div className="mt-3 space-y-2 text-sm text-amber-950">
                      {(asset.usage ?? []).map((usage, index) => (
                        <button
                          key={`${asset.id}-usage-${index}`}
                          type="button"
                          onClick={() => onOpenSection?.({
                            section: usage.section as CmsManagedSection,
                            targetId: usage.targetId,
                            targetTab: usage.targetTab,
                            targetAnchorId: usage.targetAnchorId,
                            targetField: usage.targetField,
                          })}
                          disabled={!onOpenSection}
                          className="block text-left underline decoration-amber-400 underline-offset-2 disabled:no-underline"
                        >
                          {usage.sectionLabel} · {usage.itemLabel} · {usage.field}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
                    Bilden används inte just nu och kan tas bort säkert.
                  </div>
                )}
              </div>
            </article>
              ))}
            </div>
          )}
        </div>
      )}

      {cropAsset && (
        <MediaCropDialog
          asset={cropAsset}
          onClose={() => setCropAsset(null)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
