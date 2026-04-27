"use client";

import { openCookieSettings } from "@/components/CookieConsent";

export default function FooterCookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => openCookieSettings()}
      className="font-semibold text-amber-500 transition hover:text-amber-400"
    >
      Cookie-inställningar
    </button>
  );
}
