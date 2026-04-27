"use client";

type PublishingFilterValue = "all" | "published" | "scheduled" | "draft" | "expired";
type QualityFilterValue = "all" | "ready" | "warnings" | "errors";
type SortOption = {
  value: string;
  label: string;
};

export default function ContentListFilters({
  searchValue,
  onSearchChange,
  publishingValue,
  onPublishingChange,
  qualityValue,
  onQualityChange,
  totalCount,
  visibleCount,
  extraFilters,
  sortValue,
  onSortChange,
  sortOptions,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  publishingValue: PublishingFilterValue;
  onPublishingChange: (value: PublishingFilterValue) => void;
  qualityValue: QualityFilterValue;
  onQualityChange: (value: QualityFilterValue) => void;
  totalCount: number;
  visibleCount: number;
  extraFilters?: React.ReactNode;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
}) {
  const hasActiveFilters = searchValue.trim() || publishingValue !== "all" || qualityValue !== "all";
  const hasSort = Boolean(sortValue && onSortChange && sortOptions && sortOptions.length > 0);

  return (
    <div className="mb-4 space-y-3">
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Sok i listan"
        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={publishingValue}
          onChange={(event) => onPublishingChange(event.target.value as PublishingFilterValue)}
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm"
        >
          <option value="all">Alla publiceringslages</option>
          <option value="published">Publika</option>
          <option value="scheduled">Schemalagda</option>
          <option value="draft">Utkast</option>
          <option value="expired">Utgangna</option>
        </select>
        <select
          value={qualityValue}
          onChange={(event) => onQualityChange(event.target.value as QualityFilterValue)}
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm"
        >
          <option value="all">All kvalitetsstatus</option>
          <option value="ready">Redo</option>
          <option value="warnings">Har varningar</option>
          <option value="errors">Har fel</option>
        </select>
      </div>
      {hasSort ? (
        <select
          value={sortValue}
          onChange={(event) => onSortChange?.(event.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
        >
          {sortOptions?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
      {extraFilters}
      <div className="flex items-center justify-between gap-3 text-xs text-stone-500">
        <span>
          Visar {visibleCount} av {totalCount}
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onPublishingChange("all");
              onQualityChange("all");
              if (hasSort && sortOptions?.[0]) {
                onSortChange?.(sortOptions[0].value);
              }
            }}
            className="rounded-full border border-stone-300 px-3 py-1 font-semibold text-stone-700"
          >
            Rensa filter
          </button>
        ) : null}
      </div>
    </div>
  );
}
