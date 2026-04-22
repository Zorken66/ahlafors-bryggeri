"use client";

import { useRef, useState } from "react";
import { Cropper, type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

import type { CmsMediaAsset } from "@/lib/cms-media-schema";

const aspectOptions = [
  { label: "Fri", value: NaN },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:2", value: 3 / 2 },
];

export default function MediaCropDialog({
  asset,
  onClose,
  onSave,
}: {
  asset: CmsMediaAsset;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
}) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(NaN);

  async function handleSave() {
    const cropper = cropperRef.current?.cropper;

    if (!cropper) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, asset.mimeType);
      });

      if (!blob) {
        throw new Error("Kunde inte skapa den beskurna bilden.");
      }

      const file = new File([blob], asset.originalName, { type: asset.mimeType });
      await onSave(file);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kunde inte spara beskärningen.");
    } finally {
      setSaving(false);
    }
  }

  function handleAspectChange(nextAspectRatio: number) {
    setAspectRatio(nextAspectRatio);
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return;
    }

    cropper.setAspectRatio(nextAspectRatio);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/80 p-6">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Beskär bild</h3>
            <p className="mt-1 text-sm text-stone-600">Justera utsnittet visuellt och spara tillbaka till samma mediepost.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white"
            >
              {saving ? "Sparar..." : "Spara beskärning"}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          {aspectOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleAspectChange(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                (Number.isNaN(aspectRatio) && Number.isNaN(option.value)) || aspectRatio === option.value
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950">
          <Cropper
            ref={cropperRef}
            src={asset.publicUrl}
            style={{ height: 560, width: "100%" }}
            guides
            viewMode={1}
            dragMode="move"
            background={false}
            autoCropArea={1}
            checkOrientation={false}
            responsive
            aspectRatio={aspectRatio}
          />
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
