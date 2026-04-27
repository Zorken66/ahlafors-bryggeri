"use client";

import { useEffect, useState } from "react";

import AdminUsersManager from "@/components/admin/AdminUsersManager";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AboutSectionManager from "@/components/admin/AboutSectionManager";
import ContactMessagesManager from "@/components/admin/ContactMessagesManager";
import ContactSectionManager from "@/components/admin/ContactSectionManager";
import HomepageSectionManager from "@/components/admin/HomepageSectionManager";
import MediaLibraryManager from "@/components/admin/MediaLibraryManager";
import NewsManager from "@/components/admin/NewsManager";
import ProductsManager from "@/components/admin/ProductsManager";
import RecipesManager from "@/components/admin/RecipesManager";
import RevisionsManager from "@/components/admin/RevisionsManager";
import RullerietPostsManager from "@/components/admin/RullerietPostsManager";
import RullerietSectionManager from "@/components/admin/RullerietSectionManager";
import ServicesManager from "@/components/admin/ServicesManager";
import SiteSectionManager from "@/components/admin/SiteSectionManager";
import { canRestoreRevisions, getAllowedSectionsForRole, type CmsManagedSection } from "@/lib/cms-permissions";
import type { CmsRole } from "@/lib/content-schema";
import type { SiteContent } from "@/lib/content-schema";

type CmsSection = CmsManagedSection;
type AdminStatus = {
  kind: "success" | "error";
  message: string;
};

type AdminFocusState = {
  section: CmsSection;
  targetId?: string;
  targetTab?: string;
  targetAnchorId?: string;
  targetField?: string;
  token: number;
};

type BrokenMediaResolvedDetail = {
  publicUrl?: string;
};

function isJsonEditorSection(section: CmsSection): section is keyof SiteContent {
  return !["site", "homepage", "news", "recipes", "rulleriet", "rullerietPosts", "adminUsers", "contactMessages", "revisions", "about", "contact", "products", "services", "media", "operations"].includes(section);
}

const roleLabels: Record<CmsRole, string> = {
  superadmin: "Superadmin",
  editor: "Redaktör",
  blog_editor: "Bloggredaktör",
  contact_editor: "Kontaktredaktör",
};

const sections: Array<{ key: CmsSection; label: string }> = [
  { key: "operations", label: "Översikt" },
  { key: "site", label: "Site" },
  { key: "homepage", label: "Förstasida" },
  { key: "media", label: "Media" },
  { key: "about", label: "Om oss" },
  { key: "products", label: "Produkter" },
  { key: "news", label: "Nyheter" },
  { key: "services", label: "Tjänster" },
  { key: "recipes", label: "Recept" },
  { key: "rullerietPosts", label: "Rulleriet-inlägg" },
  { key: "adminUsers", label: "Admin-användare" },
  { key: "contactMessages", label: "Kontaktmeddelanden" },
  { key: "revisions", label: "Revisionshistorik" },
  { key: "rulleriet", label: "Rulleriet" },
  { key: "contact", label: "Kontakt" },
];

export default function CmsAdmin({ username, role }: { username: string; role: CmsRole }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const allowedSections = getAllowedSectionsForRole(role);
  const [activeSection, setActiveSection] = useState<CmsSection>(
    allowedSections.includes("operations") ? "operations" : (allowedSections[0] ?? "site"),
  );
  const [editorValue, setEditorValue] = useState("");
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusState, setFocusState] = useState<AdminFocusState | null>(null);
  const [resolvedBrokenMediaUrl, setResolvedBrokenMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!status || status.kind !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStatus((current) => current?.kind === "success" ? null : current);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setStatus(null);

      const response = await fetch("/api/cms/content", { cache: "no-store" });

      if (!response.ok) {
        if (!cancelled) {
          setLoading(false);
          setStatus({ kind: "error", message: "Kunde inte läsa CMS-data." });
        }
        return;
      }

      const data = (await response.json()) as SiteContent;

      if (!cancelled) {
        setContent(data);
        if (isJsonEditorSection(activeSection)) {
          setEditorValue(JSON.stringify(data[activeSection], null, 2));
        }
        setLoading(false);
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  useEffect(() => {
    function handleBrokenMediaResolved(event: Event) {
      const detail = (event as CustomEvent<BrokenMediaResolvedDetail>).detail;

      setResolvedBrokenMediaUrl(detail?.publicUrl ?? null);
      setFocusState(null);
      setActiveSection("operations");
      setStatus({
        kind: "success",
        message: "Bildreferensen ar uppdaterad. Fortsatt arbete finns i oversikten.",
      });
    }

    window.addEventListener("cms:broken-media-resolved", handleBrokenMediaResolved as EventListener);

    return () => {
      window.removeEventListener("cms:broken-media-resolved", handleBrokenMediaResolved as EventListener);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/cms/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  function handleSectionChange(section: CmsSection) {
    setActiveSection(section);
    if (section !== "operations") {
      setResolvedBrokenMediaUrl(null);
    }
    if (content && isJsonEditorSection(section)) {
      setEditorValue(JSON.stringify(content[section], null, 2));
    }
  }

  function handleDashboardOpenSection(focus: Omit<AdminFocusState, "token">) {
    setResolvedBrokenMediaUrl(null);
    setActiveSection(focus.section);
    setFocusState({
      ...focus,
      token: Date.now(),
    });
  }

  async function persistContent(nextContent: SiteContent, options?: { sectionKey?: CmsSection; changeSummary?: string }) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: nextContent,
          sectionKey: options?.sectionKey,
          changeSummary: options?.changeSummary,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Sparning misslyckades.");
      }

      setContent(nextContent);
      setStatus({ kind: "success", message: "Ändringarna är sparade." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Kunde inte spara." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!content || !isJsonEditorSection(activeSection)) {
      return;
    }

    const updatedSection = JSON.parse(editorValue) as SiteContent[keyof SiteContent];
    const nextContent = { ...content, [activeSection]: updatedSection };
    await persistContent(nextContent, { sectionKey: activeSection, changeSummary: `Uppdaterade sektionen ${activeSection}` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">CMS-admin</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Inloggad som <strong>{username}</strong>.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {roleLabels[role]}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
              {allowedSections.length} sektioner tillgängliga
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
        >
          Logga ut
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
          <nav className="space-y-2">
            {sections.map((section) => {
              const isAllowed = allowedSections.includes(section.key);
              return (
              <button
                key={section.key}
                type="button"
                onClick={() => handleSectionChange(section.key)}
                disabled={!isAllowed}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === section.key
                    ? "bg-amber-700 text-white"
                    : isAllowed
                      ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      : "bg-stone-50 text-stone-400 opacity-70"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{section.label}</span>
                  {!isAllowed && <span className="rounded-full bg-stone-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Låst</span>}
                </span>
              </button>
            )})}
          </nav>
        </aside>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          {status && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                status.kind === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {status.message}
            </div>
          )}
          {activeSection === "rullerietPosts" && content ? (
            <RullerietPostsManager
              content={content}
              onSave={persistContent}
              initialSelectedId={focusState?.section === "rullerietPosts" ? focusState.targetId : undefined}
              initialFocusField={focusState?.section === "rullerietPosts" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "rullerietPosts" ? focusState.token : undefined}
            />
          ) : activeSection === "operations" && content ? (
            <AdminDashboard
              content={content}
              allowedSections={allowedSections}
              onOpenSection={handleDashboardOpenSection}
              resolvedBrokenMediaUrl={resolvedBrokenMediaUrl}
            />
          ) : activeSection === "homepage" && content ? (
            <HomepageSectionManager content={content} onSave={persistContent} initialFocusField={focusState?.section === "homepage" ? focusState.targetField : undefined} focusToken={focusState?.section === "homepage" ? focusState.token : undefined} />
          ) : activeSection === "site" && content ? (
            <SiteSectionManager content={content} onSave={persistContent} initialFocusField={focusState?.section === "site" ? focusState.targetField : undefined} focusToken={focusState?.section === "site" ? focusState.token : undefined} />
          ) : activeSection === "about" && content ? (
            <AboutSectionManager content={content} onSave={persistContent} initialFocusField={focusState?.section === "about" ? focusState.targetField : undefined} focusToken={focusState?.section === "about" ? focusState.token : undefined} />
          ) : activeSection === "contact" && content ? (
            <ContactSectionManager content={content} onSave={persistContent} initialFocusField={focusState?.section === "contact" ? focusState.targetField : undefined} focusToken={focusState?.section === "contact" ? focusState.token : undefined} />
          ) : activeSection === "media" ? (
            <MediaLibraryManager
              onOpenSection={handleDashboardOpenSection}
              initialAssetId={focusState?.section === "media" ? focusState.targetId : undefined}
              focusToken={focusState?.section === "media" ? focusState.token : undefined}
            />
          ) : activeSection === "news" && content ? (
            <NewsManager
              content={content}
              onSave={persistContent}
              initialSelectedId={focusState?.section === "news" ? focusState.targetId : undefined}
              initialFocusField={focusState?.section === "news" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "news" ? focusState.token : undefined}
            />
          ) : activeSection === "products" && content ? (
            <ProductsManager
              content={content}
              onSave={persistContent}
              initialSelectedId={focusState?.section === "products" ? focusState.targetId : undefined}
              initialTab={focusState?.section === "products" ? focusState.targetTab as "page" | "settings" | "products" | undefined : undefined}
              initialFocusField={focusState?.section === "products" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "products" ? focusState.token : undefined}
            />
          ) : activeSection === "services" && content ? (
            <ServicesManager
              content={content}
              onSave={persistContent}
              initialSelectedId={focusState?.section === "services" ? focusState.targetId : undefined}
              initialTab={focusState?.section === "services" ? focusState.targetTab as "page" | "services" | undefined : undefined}
              initialFocusField={focusState?.section === "services" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "services" ? focusState.token : undefined}
            />
          ) : activeSection === "recipes" && content ? (
            <RecipesManager
              content={content}
              onSave={persistContent}
              initialSelectedId={focusState?.section === "recipes" ? focusState.targetId : undefined}
              initialTab={focusState?.section === "recipes" ? focusState.targetTab as "page" | "recipes" | undefined : undefined}
              initialFocusField={focusState?.section === "recipes" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "recipes" ? focusState.token : undefined}
            />
          ) : activeSection === "rulleriet" && content ? (
            <RullerietSectionManager
              content={content}
              onSave={persistContent}
              initialFocusEventAnchorId={focusState?.section === "rulleriet" ? focusState.targetAnchorId : undefined}
              initialFocusField={focusState?.section === "rulleriet" ? focusState.targetField : undefined}
              focusToken={focusState?.section === "rulleriet" ? focusState.token : undefined}
            />
          ) : activeSection === "adminUsers" ? (
            <AdminUsersManager currentUsername={username} />
          ) : activeSection === "contactMessages" ? (
            <ContactMessagesManager />
          ) : activeSection === "revisions" ? (
            <RevisionsManager canRestore={canRestoreRevisions(role)} />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-900">{sections.find((section) => section.key === activeSection)?.label}</h2>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !content}
                  className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60"
                >
                  {loading ? "Sparar..." : "Spara"}
                </button>
              </div>
              <textarea
                value={editorValue}
                onChange={(event) => setEditorValue(event.target.value)}
                spellCheck={false}
                className="min-h-[65vh] w-full rounded-2xl border border-stone-300 bg-stone-950 p-4 font-mono text-sm leading-6 text-stone-100 outline-none transition focus:border-amber-600"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
