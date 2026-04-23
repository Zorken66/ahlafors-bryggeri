"use client";

import { summarizeQualityIssues, type QualityIssue } from "@/lib/content-quality";
import { getPublishingStatus, getPublishingStatusLabel, type PublishableFields } from "@/lib/publishing";

type PublishingFieldsProps = {
  value: PublishableFields;
  onChange: (nextValue: PublishableFields) => void;
  qualityIssues?: QualityIssue[];
};

const statusClasses = {
  draft: "bg-stone-200 text-stone-700",
  scheduled: "bg-sky-100 text-sky-800",
  published: "bg-green-100 text-green-800",
  expired: "bg-amber-100 text-amber-800",
} as const;

export default function PublishingFields({ value, onChange, qualityIssues = [] }: PublishingFieldsProps) {
  const status = getPublishingStatus(value);
  const qualitySummary = summarizeQualityIssues(qualityIssues);
  const hasErrors = qualitySummary.errors > 0;
  const isPublished = value.published !== false;

  function handlePublishedChange(nextPublished: boolean) {
    if (nextPublished && hasErrors) {
      return;
    }

    onChange({ ...value, published: nextPublished });
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Publicering</h3>
          <p className="mt-1 text-xs text-stone-500">
            Styr om innehållet är utkast, schemalagt, publikt eller utgånget.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasErrors && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
              Inte redo
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
            {getPublishingStatusLabel(status)}
          </span>
        </div>
      </div>

      {hasErrors && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">Innehållet har {qualitySummary.errors} fel och är inte redo att publiceras.</p>
          <p className="mt-1 text-xs text-red-700">Rätta felen ovan först. Du kan fortfarande spara innehållet som utkast.</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => handlePublishedChange(event.target.checked)}
            disabled={hasErrors && !isPublished}
          />
          Publicerad
        </label>
        <div className="text-xs text-stone-500 md:text-right">
          {hasErrors
            ? "Publicering blockeras tills felen är rättade. Tomt publiceringsdatum betyder publicera direkt."
            : "Tomt publiceringsdatum betyder publicera direkt. Tomt avpubliceringsdatum betyder tills vidare."}
        </div>
        <label className="space-y-2 text-sm font-semibold text-stone-700">
          <span className="block">Publiceras</span>
          <input
            type="date"
            value={value.publishedAt ?? ""}
            onChange={(event) => onChange({ ...value, publishedAt: event.target.value || undefined })}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 font-normal"
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-stone-700">
          <span className="block">Avpubliceras</span>
          <input
            type="date"
            value={value.unpublishedAt ?? ""}
            onChange={(event) => onChange({ ...value, unpublishedAt: event.target.value || undefined })}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 font-normal"
          />
        </label>
      </div>
    </div>
  );
}
