"use client";

import { useEffect, useState } from "react";

import SectionTabs from "@/components/admin/SectionTabs";
import type { CmsManagedSection } from "@/lib/cms-permissions";
import type { FooterLink, FooterSocialLink, RedirectEntry, SiteContent } from "@/lib/content-schema";

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function formatFooterLinks(links: FooterLink[]) {
  return links.map((link) => `${link.label}|${link.href}`).join("\n");
}

function parseFooterLinks(value: string): FooterLink[] {
  return splitLines(value)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      const href = rest.join("|").trim();
      return {
        label: label?.trim() ?? "",
        href,
      };
    })
    .filter((link) => link.label && link.href);
}

function formatFooterSocialLinks(links: FooterSocialLink[]) {
  return links.map((link) => `${link.platform}|${link.url}`).join("\n");
}

function parseFooterSocialLinks(value: string): FooterSocialLink[] {
  return splitLines(value)
    .map((line) => {
      const [platform, ...rest] = line.split("|");
      const url = rest.join("|").trim();
      return {
        platform: platform?.trim() ?? "",
        url,
      };
    })
    .filter((link) => link.platform && link.url);
}

function formatRedirects(redirects: RedirectEntry[]) {
  return redirects.map((redirect) => `${redirect.source}|${redirect.destination}|${redirect.permanent ? "permanent" : "temporary"}`).join("\n");
}

function normalizeRedirectPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("#")) {
    return trimmed;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parseRedirects(value: string): RedirectEntry[] {
  return splitLines(value)
    .map((line) => {
      const [source, destination, mode] = line.split("|").map((part) => part.trim());
      return {
        source: normalizeRedirectPath(source ?? ""),
        destination: normalizeRedirectPath(destination ?? ""),
        permanent: mode?.toLowerCase() !== "temporary",
      };
    })
    .filter((redirect) => redirect.source && redirect.destination);
}

export default function SiteSectionManager({
  content,
  onSave,
}: {
  content: SiteContent;
  onSave: (nextContent: SiteContent, options?: { sectionKey?: CmsManagedSection; changeSummary?: string }) => Promise<void>;
}) {
  const [draft, setDraft] = useState(content.site);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"metadata" | "footer" | "redirects">("metadata");

  useEffect(() => {
    setDraft(content.site);
  }, [content.site]);

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      await onSave(
        { ...content, site: draft },
        {
          sectionKey: "site",
          changeSummary: activeTab === "footer"
            ? "Uppdaterade footerinnehåll"
            : activeTab === "redirects"
              ? "Uppdaterade redirects"
              : "Uppdaterade webbplatsmetadata",
        },
      );
      setStatus("Sparat.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Site</h2>
          <p className="mt-1 text-sm text-stone-600">Global metadata och grundinställningar för sajten.</p>
        </div>
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
          {saving ? "Sparar..." : activeTab === "footer" ? "Spara footer" : activeTab === "redirects" ? "Spara redirects" : "Spara inställningar"}
        </button>
      </div>

      <SectionTabs
        tabs={[
          { id: "metadata", label: "Metadata" },
          { id: "footer", label: "Footer" },
          { id: "redirects", label: "Redirects" },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as "metadata" | "footer" | "redirects")}
      />

      {activeTab === "metadata" ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Företagsnamn</span>
              <input value={draft.companyName} onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-titel</span>
              <input value={draft.metadataTitle} onChange={(event) => setDraft((current) => ({ ...current, metadataTitle: event.target.value }))} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-beskrivning</span>
            <textarea value={draft.metadataDescription} onChange={(event) => setDraft((current) => ({ ...current, metadataDescription: event.target.value }))} rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Metadata-nyckelord, ett per rad</span>
            <textarea value={draft.metadataKeywords.join("\n")} onChange={(event) => setDraft((current) => ({ ...current, metadataKeywords: splitLines(event.target.value) }))} rows={5} className="w-full rounded-xl border border-stone-300 px-4 py-3" />
          </label>
        </div>
      ) : activeTab === "footer" ? (
        <div className="space-y-6 rounded-3xl border border-stone-200 p-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Footer</h3>
            <p className="mt-1 text-sm text-stone-600">Redigera globalt innehåll för footern. Länkfält använder formatet `Label|/sokvag` eller `Plattform|https://...`, en rad per post.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Rubrik</span>
              <input
                value={draft.footer.brandHeading}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, brandHeading: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Navigationstitel</span>
              <input
                value={draft.footer.navigationTitle}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, navigationTitle: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Ingress / brödtext</span>
            <textarea
              value={draft.footer.brandText}
              onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, brandText: event.target.value } }))}
              rows={4}
              className="w-full rounded-xl border border-stone-300 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Navigationslänkar</span>
            <textarea
              value={formatFooterLinks(draft.footer.navigationLinks)}
              onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, navigationLinks: parseFooterLinks(event.target.value) } }))}
              rows={6}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Kontaktsektionens titel</span>
              <input
                value={draft.footer.contactTitle}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, contactTitle: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Social sektionstitel</span>
              <input
                value={draft.footer.socialTitle}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, socialTitle: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Kontaktuppgifter, en rad per rad</span>
            <textarea
              value={draft.footer.contactLines.join("\n")}
              onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, contactLines: splitLines(event.target.value) } }))}
              rows={5}
              className="w-full rounded-xl border border-stone-300 px-4 py-3"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Kontaktlänk, etikett</span>
              <input
                value={draft.footer.contactLinkLabel}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, contactLinkLabel: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Kontaktlänk, adress</span>
              <input
                value={draft.footer.contactLinkHref}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, contactLinkHref: event.target.value } }))}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Sociala länkar</span>
            <textarea
              value={formatFooterSocialLinks(draft.footer.socialLinks)}
              onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, socialLinks: parseFooterSocialLinks(event.target.value) } }))}
              rows={4}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Juridisk rad</span>
              <textarea
                value={draft.footer.legalText}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, legalText: event.target.value } }))}
                rows={3}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Ansvarsrad</span>
              <textarea
                value={draft.footer.disclaimerText}
                onChange={(event) => setDraft((current) => ({ ...current, footer: { ...current.footer, disclaimerText: event.target.value } }))}
                rows={3}
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6 rounded-3xl border border-stone-200 p-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Redirects</h3>
            <p className="mt-1 text-sm text-stone-600">Hantera gamla länkar som ska skickas vidare till nya adresser. Format: `kalla|mal|permanent` eller `kalla|mal|temporary`, en rad per redirect.</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Redirectlista</span>
            <textarea
              value={formatRedirects(draft.redirects)}
              onChange={(event) => setDraft((current) => ({ ...current, redirects: parseRedirects(event.target.value) }))}
              rows={12}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 font-mono text-sm"
            />
          </label>
        </div>
      )}

      {status ? <p className={`text-sm ${status === "Sparat." ? "text-green-700" : "text-red-700"}`}>{status}</p> : null}
    </div>
  );
}
