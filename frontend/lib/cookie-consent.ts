export const COOKIE_CONSENT_COOKIE = "ahlafors_cookie_consent";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const COOKIE_CONSENT_VERSION = 1;

export type CookieConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  updatedAt: string;
};

export function createDefaultCookieConsent(): CookieConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCookieConsent(
  value: Partial<CookieConsentPreferences> | null | undefined,
): CookieConsentPreferences {
  return {
    necessary: true,
    analytics: value?.analytics === true,
    marketing: value?.marketing === true,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}
