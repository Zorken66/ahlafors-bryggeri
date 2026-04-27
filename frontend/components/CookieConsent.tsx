"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_MAX_AGE_SECONDS,
  createDefaultCookieConsent,
  normalizeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";

const OPEN_COOKIE_SETTINGS_EVENT = "open-cookie-settings";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function readStoredConsent() {
  const rawValue = readCookie(COOKIE_CONSENT_COOKIE);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeCookieConsent(JSON.parse(rawValue) as Partial<CookieConsentPreferences>);
  } catch {
    return null;
  }
}

function saveConsent(preferences: CookieConsentPreferences) {
  writeCookie(COOKIE_CONSENT_COOKIE, JSON.stringify(preferences), COOKIE_CONSENT_MAX_AGE_SECONDS);
}

function CookieToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${disabled ? "border-stone-200 bg-stone-50" : "border-stone-300 bg-white"}`}>
      <div>
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
      </div>
      <span className="relative mt-1 inline-flex">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span className={`h-7 w-12 rounded-full transition ${checked ? "bg-amber-700" : "bg-stone-300"} ${disabled ? "opacity-80" : ""}`} />
        <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </label>
  );
}

export default function CookieConsent() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [mounted, setMounted] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(createDefaultCookieConsent());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      const storedConsent = readStoredConsent();

      if (storedConsent) {
        setPreferences(storedConsent);
        setIsBannerOpen(false);
        return;
      }

      setPreferences(createDefaultCookieConsent());
      setIsBannerOpen(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleOpenSettings() {
      setIsSettingsOpen(true);
      setIsBannerOpen(false);
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
  }, []);

  const effectivePreferences = useMemo(() => normalizeCookieConsent(preferences), [preferences]);

  if (!mounted || isAdminRoute) {
    return null;
  }

  function persist(nextPreferences: CookieConsentPreferences) {
    const normalized = normalizeCookieConsent({
      ...nextPreferences,
      updatedAt: new Date().toISOString(),
    });
    setPreferences(normalized);
    saveConsent(normalized);
    setIsBannerOpen(false);
    setIsSettingsOpen(false);
  }

  function acceptNecessaryOnly() {
    persist({
      ...createDefaultCookieConsent(),
      updatedAt: new Date().toISOString(),
    });
  }

  function acceptAll() {
    persist({
      necessary: true,
      analytics: true,
      marketing: true,
      version: effectivePreferences.version,
      updatedAt: new Date().toISOString(),
    });
  }

  function saveCurrentSelection() {
    persist(effectivePreferences);
  }

  return (
    <>
      {(isBannerOpen || isSettingsOpen) && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-stone-300 bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Kakor</p>
                  <h2 className="mt-2 text-2xl font-bold text-stone-900">Hantera kakor på webbplatsen</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                    Vi använder nödvändiga kakor för att webbplatsen ska fungera och för att komma ihåg ditt val för kakor.
                    Den publika sajten använder just nu inga aktiva statistik- eller marknadsföringskakor, men du kan redan nu spara ett val för framtida aktivering.
                  </p>
                </div>
                {!isSettingsOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                  >
                    Anpassa val
                  </button>
                )}
              </div>

              <div className="grid gap-3">
                <CookieToggle
                  label="Nödvändiga kakor"
                  description="Krävs för grundläggande funktioner, till exempel att komma ihåg ditt cookieval. I admin används även en nödvändig sessionskaka för inloggning."
                  checked
                  disabled
                />
                <CookieToggle
                  label="Statistik"
                  description="Ingen statistikcookie används på den publika sajten just nu. Om vi aktiverar anonym statistik senare används ditt sparade val."
                  checked={effectivePreferences.analytics}
                  onChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
                />
                <CookieToggle
                  label="Marknadsföring"
                  description="Ingen marknadsföringscookie används på den publika sajten just nu. Om vi aktiverar exempelvis tredjepartsinnehåll senare används ditt sparade val."
                  checked={effectivePreferences.marketing}
                  onChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-stone-500">
                  Läs mer på <Link href="/kakor" className="font-semibold text-amber-700 underline underline-offset-4">kaksidan</Link>. Du kan ändra ditt val när som helst från footern.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={acceptNecessaryOnly}
                    className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
                  >
                    Endast nödvändiga
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentSelection}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    Spara val
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
                  >
                    Godkänn alla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
