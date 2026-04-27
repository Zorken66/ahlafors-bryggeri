"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CmsMediaAsset } from "@/lib/cms-media-schema";

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} kB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUsageLabel(count: number | undefined) {
  if (!count) {
    return "Oanvand";
  }

  return count === 1 ? "1 anvandning" : `${count} anvandningar`;
}

function announceResolvedBrokenReference(publicUrl: string) {
  window.dispatchEvent(new CustomEvent("cms:broken-media-resolved", {
    detail: { publicUrl },
  }));
}

function tokenizeMediaValue(input: string) {
  return input
    .split("/")
    .pop()
    ?.toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3) ?? [];
}

function getMediaFilename(input: string) {
  return input.split("/").pop() ?? input;
}

function getReplacementSortScore(asset: CmsMediaAsset, currentValue: string) {
  const candidate = `${asset.displayName} ${asset.originalName} ${asset.filename}`.toLowerCase();
  const tokens = tokenizeMediaValue(currentValue);
  const tokenMatches = tokens.reduce((count, token) => count + (candidate.includes(token) ? 1 : 0), 0);
  const createdAtTime = Number(new Date(asset.createdAt));

  return (
    tokenMatches * 1000 +
    (asset.altText ? 200 : 0) +
    (!asset.usageCount ? 100 : 0) +
    Math.round(createdAtTime / 100000000)
  );
}

function matchesReplacementTokens(asset: CmsMediaAsset, tokens: string[]) {
  if (tokens.length === 0) {
    return false;
  }

  const haystack = `${asset.displayName} ${asset.originalName} ${asset.filename}`.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

export default function MediaPickerField({
  label,
  value,
  onChange,
  fieldId,
  activeFocusField,
  focusToken,
  onAutoCommit,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  fieldId?: string;
  activeFocusField?: string;
  focusToken?: number;
  onAutoCommit?: (nextValue: string) => Promise<void> | void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<CmsMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlySuggested, setShowOnlySuggested] = useState(false);
  const [showOnlyUnused, setShowOnlyUnused] = useState(false);
  const [showOnlyWithAltText, setShowOnlyWithAltText] = useState(false);
  const containerRef = useRef<HTMLLabelElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const isReplacementFlow = Boolean(focusToken && fieldId && activeFocusField === fieldId && isOpen);
  const replacementTokens = useMemo(() => tokenizeMediaValue(value), [value]);
  const currentReferenceFilename = useMemo(() => getMediaFilename(value), [value]);
  const visibleAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredAssets = assets.filter((asset) => {
      const haystack = `${asset.displayName} ${asset.originalName} ${asset.filename} ${asset.altText ?? ""}`.toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesSuggested = !showOnlySuggested || replacementTokens.some((token) => haystack.includes(token));
      const matchesUnused = !showOnlyUnused || !asset.usageCount;
      const matchesAltText = !showOnlyWithAltText || Boolean(asset.altText);

      return matchesSearch && matchesSuggested && matchesUnused && matchesAltText;
    });

    if (!isReplacementFlow) {
      return filteredAssets;
    }

    return [...filteredAssets].sort((left, right) => getReplacementSortScore(right, value) - getReplacementSortScore(left, value));
  }, [assets, isReplacementFlow, replacementTokens, searchTerm, showOnlySuggested, showOnlyUnused, showOnlyWithAltText, value]);
  const suggestedAssets = useMemo(() => {
    if (!isReplacementFlow || replacementTokens.length === 0) {
      return [];
    }

    return visibleAssets.filter((asset) => matchesReplacementTokens(asset, replacementTokens)).slice(0, 6);
  }, [isReplacementFlow, replacementTokens, visibleAssets]);
  const libraryAssets = useMemo(() => {
    if (suggestedAssets.length === 0) {
      return visibleAssets;
    }

    const suggestedIds = new Set(suggestedAssets.map((asset) => asset.id));
    return visibleAssets.filter((asset) => !suggestedIds.has(asset.id));
  }, [suggestedAssets, visibleAssets]);
  const topSuggestedAsset = suggestedAssets[0] ?? null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearchTerm("");
    setShowOnlySuggested(false);
    setShowOnlyUnused(false);
    setShowOnlyWithAltText(false);
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen || !searchInputRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function selectTopSuggestedAsset() {
      if (!topSuggestedAsset) {
        return;
      }

      onChange(topSuggestedAsset.publicUrl);

      if (isReplacementFlow && onAutoCommit) {
        setCommitting(true);

        try {
          await onAutoCommit(topSuggestedAsset.publicUrl);
          announceResolvedBrokenReference(topSuggestedAsset.publicUrl);
        } finally {
          setCommitting(false);
          setIsOpen(false);
        }

        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.defaultPrevented || committing || !topSuggestedAsset) {
        return;
      }

      const target = event.target;
      const isTextInputTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (!isTextInputTarget && !(target instanceof HTMLButtonElement)) {
        return;
      }

      event.preventDefault();
      void selectTopSuggestedAsset();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [committing, isOpen, isReplacementFlow, onAutoCommit, onChange, topSuggestedAsset]);

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

  useEffect(() => {
    if (!focusToken || !fieldId || activeFocusField !== fieldId) {
      return;
    }

    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsOpen(true);
  }, [activeFocusField, fieldId, focusToken]);

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

      if (isReplacementFlow && onAutoCommit) {
        setCommitting(true);

        try {
          await onAutoCommit(asset.publicUrl);
          announceResolvedBrokenReference(asset.publicUrl);
          setIsOpen(false);
        } finally {
          setCommitting(false);
        }
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Kunde inte ladda upp bilden.");
    } finally {
      setUploading(false);
    }
  }

  function selectAsset(asset: CmsMediaAsset) {
    onChange(asset.publicUrl);
    if (isReplacementFlow && onAutoCommit) {
      setCommitting(true);
      Promise.resolve(onAutoCommit(asset.publicUrl))
        .then(() => {
          announceResolvedBrokenReference(asset.publicUrl);
        })
        .finally(() => {
          setCommitting(false);
          setIsOpen(false);
        });
      return;
    }

    setIsOpen(false);
  }

  function renderAssetCard(asset: CmsMediaAsset) {
    const isSuggestedMatch = matchesReplacementTokens(asset, replacementTokens);

    return (
      <button
        key={asset.id}
        type="button"
        onClick={() => selectAsset(asset)}
        disabled={committing}
        className={`overflow-hidden rounded-2xl border text-left transition ${
          value === asset.publicUrl ? "border-amber-700 bg-amber-50" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
        } ${committing ? "opacity-60" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.publicUrl} alt={asset.altText ?? ""} className="h-48 w-full object-cover" />
        <div className="space-y-2 p-4">
          <p className="truncate text-sm font-semibold text-stone-900">{asset.displayName}</p>
          <p className="text-xs text-stone-500">{asset.altText || "Ingen alt-text"} • {formatFileSize(asset.sizeBytes)}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`rounded-full px-2 py-1 ${asset.altText ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {asset.altText ? "Alt-text satt" : "Saknar alt-text"}
            </span>
            <span className={`rounded-full px-2 py-1 ${asset.usageCount ? "bg-stone-200 text-stone-700" : "bg-green-100 text-green-800"}`}>
              {formatUsageLabel(asset.usageCount)}
            </span>
            {isReplacementFlow && isSuggestedMatch && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">
                Liknar trasig referens
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <>
      <label ref={containerRef} className="block">
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
                    ref={uploadInputRef}
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
                  disabled={committing}
                  className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:opacity-60"
                >
                  Stäng
                </button>
              </div>
            </div>

            {isReplacementFlow && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">Ersattningslage for aktiv referens.</p>
                    <p className="mt-1">{committing ? "Sparar andringen direkt..." : "Valj en ny bild for detta falt sa sparas andringen direkt."}</p>
                    <p className="mt-2 break-all rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-amber-950">
                      Trasig referens: {currentReferenceFilename}
                    </p>
                    {replacementTokens.length > 0 && (
                      <>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                          Kandidater prioriteras efter namntraff, alt-text, oanvant media och nyare filer.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {replacementTokens.map((token) => (
                            <span key={token} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                              {token}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={uploading || committing}
                    className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-60"
                  >
                    {uploading ? "Laddar upp..." : "Ladda upp ersattningsbild"}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Sok i namn, filnamn eller alt-text"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
              />
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {isReplacementFlow && replacementTokens.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowOnlySuggested((current) => !current)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${showOnlySuggested ? "bg-amber-700 text-white" : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"}`}
                >
                  Bara forslag
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowOnlyUnused((current) => !current)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${showOnlyUnused ? "bg-stone-900 text-white" : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"}`}
              >
                Bara oanvant
              </button>
              <button
                type="button"
                onClick={() => setShowOnlyWithAltText((current) => !current)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${showOnlyWithAltText ? "bg-green-700 text-white" : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"}`}
              >
                Med alt-text
              </button>
              {(searchTerm || showOnlySuggested || showOnlyUnused || showOnlyWithAltText) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setShowOnlySuggested(false);
                    setShowOnlyUnused(false);
                    setShowOnlyWithAltText(false);
                  }}
                  className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500"
                >
                  Rensa filter
                </button>
              )}
            </div>
            {isReplacementFlow && visibleAssets.length > 0 && suggestedAssets.length === 0 && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p className="font-semibold">Inga tydliga forslag hittades i biblioteket.</p>
                <p className="mt-1">
                  Du kan fortfarande valja en befintlig bild nedan, men det ar sannolikt snabbare att ladda upp ratt ersattningsbild direkt.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={uploading || committing}
                    className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-60"
                  >
                    Ladda upp ersattningsbild
                  </button>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-sm text-stone-500">Läser bilder...</p>
            ) : visibleAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-500">
                <p>Inga bilder matchar filtret just nu.</p>
                {(searchTerm || showOnlySuggested || showOnlyUnused || showOnlyWithAltText) && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setShowOnlySuggested(false);
                        setShowOnlyUnused(false);
                        setShowOnlyWithAltText(false);
                      }}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                    >
                      Visa alla bilder igen
                    </button>
                    {isReplacementFlow && (
                      <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={uploading || committing}
                        className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-60"
                      >
                        Ladda upp ny bild
                      </button>
                    )}
                  </div>
                )}
                {!searchTerm && !showOnlySuggested && !showOnlyUnused && !showOnlyWithAltText && isReplacementFlow && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      disabled={uploading || committing}
                      className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-60"
                    >
                      Ladda upp ny bild
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {suggestedAssets.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">Hogst rankade forslag</h4>
                        <p className="mt-1 text-sm text-stone-600">De mest sannolika ersattarna visas forst.</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        {suggestedAssets.length} forslag
                      </span>
                    </div>
                    {topSuggestedAsset && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">Basta kandidat</p>
                            <p className="mt-2 text-sm font-semibold text-amber-950">{topSuggestedAsset.displayName}</p>
                            <p className="mt-1 text-sm text-amber-900">
                              {topSuggestedAsset.altText || "Ingen alt-text"} · {formatUsageLabel(topSuggestedAsset.usageCount)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                              {matchesReplacementTokens(topSuggestedAsset, replacementTokens) && (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">
                                  Namntraff mot trasig referens
                                </span>
                              )}
                              {topSuggestedAsset.altText && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                                  Har alt-text
                                </span>
                              )}
                              {!topSuggestedAsset.usageCount && (
                                <span className="rounded-full bg-stone-200 px-2 py-1 text-stone-800">
                                  Oanvand i innehall
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                              Enter valjer denna direkt
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectAsset(topSuggestedAsset)}
                            disabled={committing}
                            className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-60"
                          >
                            Anvand basta kandidat
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestedAssets.map((asset) => renderAssetCard(asset))}
                    </div>
                  </div>
                )}

                {libraryAssets.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-700">
                          {suggestedAssets.length > 0 ? "Ovrigt bibliotek" : "Mediebibliotek"}
                        </h4>
                        <p className="mt-1 text-sm text-stone-600">
                          {suggestedAssets.length > 0 ? "Fler bilder som matchar dina filter men inte toppforslagen." : "Alla bilder som matchar aktuella filter."}
                        </p>
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                        {libraryAssets.length} bilder
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {libraryAssets.map((asset) => renderAssetCard(asset))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
