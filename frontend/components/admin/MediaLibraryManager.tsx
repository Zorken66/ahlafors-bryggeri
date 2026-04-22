"use client";

import { useEffect, useState } from "react";

import MediaCropDialog from "@/components/admin/MediaCropDialog";
import type { CmsMediaAsset } from "@/lib/cms-media-schema";

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} kB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function parseApiResponse<T>(response: Response): Promise<T | { error?: string }> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await response.json() as T | { error?: string };
  }

  const text = await response.text();
  return { error: text || "Servern svarade inte med JSON." };
}

export default function MediaLibraryManager() {
  const [assets, setAssets] = useState<CmsMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropAsset, setCropAsset] = useState<CmsMediaAsset | null>(null);

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
        <div className="grid gap-6 xl:grid-cols-2">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.publicUrl} alt={asset.altText ?? ""} className="h-64 w-full object-cover" />
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500">
                  <span>{asset.displayName}</span>
                  <span>{formatFileSize(asset.sizeBytes)}</span>
                  <span>{new Date(asset.createdAt).toLocaleString("sv-SE")}</span>
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
              </div>
            </article>
          ))}
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
