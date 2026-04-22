"use client";

import { useEffect, useMemo, useState } from "react";

import HeroOverlayField from "@/components/admin/HeroOverlayField";
import MediaPickerField from "@/components/admin/MediaPickerField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { RullerietEvent, SiteContent } from "@/lib/content-schema";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function createEmptyEvent(): RullerietEvent {
  return {
    id: crypto.randomUUID(),
    date: "",
    time: "",
    endTime: "",
    title: "",
    description: "",
    image: "",
    food: "",
    location: "",
    ticketUrl: "",
    featured: false,
    published: true,
  };
}

function sortEvents(events: RullerietEvent[]) {
  return [...events].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export default function RullerietSectionManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [draft, setDraft] = useState(content.rulleriet);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraft(content.rulleriet);
  }, [content.rulleriet]);

  const upcomingCount = useMemo(() => draft.events.filter((event) => event.published !== false).length, [draft.events]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave({
        ...content,
        rulleriet: {
          ...draft,
          events: sortEvents(draft.events).map((event) => ({
            ...event,
            endTime: event.endTime?.trim() || undefined,
            image: event.image?.trim() || undefined,
            food: event.food?.trim() || undefined,
            location: event.location?.trim() || undefined,
            ticketUrl: event.ticketUrl?.trim() || undefined,
            published: event.published ?? true,
            featured: event.featured ?? false,
          })),
        },
      }, {
        sectionKey: "rulleriet",
        changeSummary: "Uppdaterade Rulleriet-sektionen och evenemangen",
      });
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  function updateEvent(id: string, patch: Partial<RullerietEvent>) {
    setDraft((current) => ({
      ...current,
      events: current.events.map((event) => event.id === id ? { ...event, ...patch } : event),
    }));
  }

  function addEvent() {
    setDraft((current) => ({
      ...current,
      events: [...current.events, createEmptyEvent()],
    }));
  }

  function duplicateEvent(id: string) {
    const source = draft.events.find((event) => event.id === id);
    if (!source) {
      return;
    }

    setDraft((current) => ({
      ...current,
      events: [...current.events, { ...source, id: crypto.randomUUID(), title: `${source.title} kopia` }],
    }));
  }

  function removeEvent(id: string) {
    setDraft((current) => ({
      ...current,
      events: current.events.filter((event) => event.id !== id),
    }));
  }

  function moveEvent(id: string, direction: -1 | 1) {
    setDraft((current) => {
      const index = current.events.findIndex((event) => event.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.events.length) {
        return current;
      }

      const nextEvents = [...current.events];
      const [moved] = nextEvents.splice(index, 1);
      nextEvents.splice(nextIndex, 0, moved);
      return { ...current, events: nextEvents };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Rulleriet</h2>
          <p className="mt-1 text-sm text-stone-600">Hero, intro, bloggintro, SEO och en riktig evenemangshantering.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
          {saving ? "Sparar..." : "Spara"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input value={draft.heroTitle} onChange={(event) => setDraft((current) => ({ ...current, heroTitle: event.target.value }))} placeholder="Hero-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.heroSubtitle} onChange={(event) => setDraft((current) => ({ ...current, heroSubtitle: event.target.value }))} placeholder="Hero-undertitel" className="rounded-xl border border-stone-300 px-4 py-3" />
        <div className="md:col-span-2">
          <MediaPickerField value={draft.heroImage} onChange={(value) => setDraft((current) => ({ ...current, heroImage: value }))} label="Hero-bild" />
        </div>
        <div className="md:col-span-2">
          <HeroOverlayField value={draft.heroOverlayOpacity} onChange={(value) => setDraft((current) => ({ ...current, heroOverlayOpacity: value }))} />
        </div>
        <input value={draft.seoTitle ?? ""} onChange={(event) => setDraft((current) => ({ ...current, seoTitle: event.target.value }))} placeholder="SEO-titel" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.seoDescription ?? ""} onChange={(event) => setDraft((current) => ({ ...current, seoDescription: event.target.value }))} placeholder="SEO-beskrivning" className="rounded-xl border border-stone-300 px-4 py-3" />
      </div>

      <input value={draft.introTitle} onChange={(event) => setDraft((current) => ({ ...current, introTitle: event.target.value }))} placeholder="Intro-rubrik" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
      <textarea value={draft.introParagraphs.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, introParagraphs: splitLines(event.target.value) }))} placeholder="Introstycken, en per rad" rows={6} className="w-full rounded-xl border border-stone-300 px-4 py-3" />

      <div className="grid gap-4 md:grid-cols-2">
        <input value={draft.paymentTitle} onChange={(event) => setDraft((current) => ({ ...current, paymentTitle: event.target.value }))} placeholder="Betalningsrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.paymentText} onChange={(event) => setDraft((current) => ({ ...current, paymentText: event.target.value }))} placeholder="Betalningstext" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.blogTitle} onChange={(event) => setDraft((current) => ({ ...current, blogTitle: event.target.value }))} placeholder="Bloggrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.blogIntro} onChange={(event) => setDraft((current) => ({ ...current, blogIntro: event.target.value }))} placeholder="Bloggintro" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.locationTitle} onChange={(event) => setDraft((current) => ({ ...current, locationTitle: event.target.value }))} placeholder="Platsrubrik" className="rounded-xl border border-stone-300 px-4 py-3" />
        <input value={draft.locationText} onChange={(event) => setDraft((current) => ({ ...current, locationText: event.target.value }))} placeholder="Platstext" className="rounded-xl border border-stone-300 px-4 py-3" />
      </div>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Evenemang</h3>
            <p className="mt-1 text-sm text-stone-600">Lägg upp kvällar, AW, provningar och specialevent som egna poster.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
              {draft.events.length} st
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              {upcomingCount} publicerade
            </span>
            <button type="button" onClick={addEvent} className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">
              Nytt evenemang
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {draft.events.map((event, index) => (
            <article key={event.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold text-stone-900">{event.title || `Evenemang ${index + 1}`}</h4>
                    {event.featured && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Utvalt</span>}
                    {(event.published ?? true) ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Publicerat</span>
                    ) : (
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">Utkast</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {event.date || "Datum saknas"} {event.time ? `kl. ${event.time}` : ""}
                    {event.endTime ? `-${event.endTime}` : ""}
                    {event.location ? ` • ${event.location}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => moveEvent(event.id, -1)} disabled={index === 0} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40">Upp</button>
                  <button type="button" onClick={() => moveEvent(event.id, 1)} disabled={index === draft.events.length - 1} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40">Ner</button>
                  <button type="button" onClick={() => duplicateEvent(event.id)} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700">Duplicera</button>
                  <button type="button" onClick={() => removeEvent(event.id)} className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Ta bort</button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Datum</span>
                  <input type="date" value={event.date} onChange={(e) => updateEvent(event.id, { date: e.target.value })} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Starttid</span>
                  <input type="time" value={event.time} onChange={(e) => updateEvent(event.id, { time: e.target.value })} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Sluttid</span>
                  <input type="time" value={event.endTime ?? ""} onChange={(e) => updateEvent(event.id, { endTime: e.target.value })} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Plats</span>
                  <input value={event.location ?? ""} onChange={(e) => updateEvent(event.id, { location: e.target.value })} placeholder="Rulleriet, Alafors" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <label className="block md:col-span-2 xl:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Titel</span>
                  <input value={event.title} onChange={(e) => updateEvent(event.id, { title: e.target.value })} placeholder="AW med quiz" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <label className="block md:col-span-2 xl:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Mat / foodtruck</span>
                  <input value={event.food ?? ""} onChange={(e) => updateEvent(event.id, { food: e.target.value })} placeholder="Tacos, pizza eller gästkök" className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
                <div className="md:col-span-2 xl:col-span-4">
                  <MediaPickerField
                    value={event.image ?? ""}
                    onChange={(value) => updateEvent(event.id, { image: value })}
                    label="Evenemangsbild"
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-3">
                  <RichTextEditor
                    label="Beskrivning"
                    value={event.description}
                    onChange={(value) => updateEvent(event.id, { description: value })}
                    placeholder="Beskriv kvällen, vad som händer och varför man ska komma."
                    minHeightClassName="min-h-[180px]"
                  />
                </div>
                <label className="block md:col-span-2 xl:col-span-1">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Biljettlänk</span>
                  <input value={event.ticketUrl ?? ""} onChange={(e) => updateEvent(event.id, { ticketUrl: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-stone-300 px-4 py-3" />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-6">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <input type="checkbox" checked={event.featured ?? false} onChange={(e) => updateEvent(event.id, { featured: e.target.checked })} />
                  Utvalt evenemang
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-stone-700">
                  <input type="checkbox" checked={event.published ?? true} onChange={(e) => updateEvent(event.id, { published: e.target.checked })} />
                  Publicerat
                </label>
              </div>
            </article>
          ))}

          {draft.events.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-8 text-center text-sm text-stone-500">
              Inga evenemang ännu. Klicka på <strong>Nytt evenemang</strong> för att skapa det första.
            </div>
          )}
        </div>
      </section>

      {status && <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p>}
    </div>
  );
}
