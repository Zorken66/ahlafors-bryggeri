"use client";

import { useEffect, useState } from "react";

import type { CmsMediaAsset } from "@/lib/cms-media-schema";

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} kB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<CmsMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    async function loadAssets() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cms/media", { cache: "no-store" });
        const data = await response.json() as CmsMediaAsset[] | { error?: string };

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
  }, [isOpen]);

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });

      const data = await response.json() as CmsMediaAsset | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Kunde inte ladda upp bilden.");
      }

      const asset = data as CmsMediaAsset;
      setAssets((current) => [asset, ...current]);
      onChange(asset.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Kunde inte ladda upp bilden.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
        <div className="flex gap-3">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Bild-URL eller välj från biblioteket"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="shrink-0 rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
          >
            Välj bild
          </button>
        </div>
        {value && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-40 w-full object-cover" />
          </div>
        )}
      </label>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-6">
          <div className="max-h-[85vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Mediebibliotek</h3>
                <p className="mt-1 text-sm text-stone-600">Ladda upp en bild eller välj en befintlig fil.</p>
              </div>
              <div className="flex flex-wrap gap-3">
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
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                >
                  Stäng
                </button>
              </div>
            </div>

            {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {loading ? (
              <p className="text-sm text-stone-500">Läser bilder...</p>
            ) : assets.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-500">
                Inga bilder ännu. Ladda upp den första filen här.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onChange(asset.publicUrl);
                      setIsOpen(false);
                    }}
                    className={`overflow-hidden rounded-2xl border text-left transition ${
                      value === asset.publicUrl ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.publicUrl} alt={asset.altText ?? ""} className="h-48 w-full object-cover" />
                    <div className="space-y-2 p-4">
                      <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
                      <p className="text-xs text-stone-500">{asset.altText || "Ingen alt-text"} • {formatFileSize(asset.sizeBytes)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
