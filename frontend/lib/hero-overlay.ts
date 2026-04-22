import type { CSSProperties } from "react";

const HERO_OVERLAY_RGB = "28, 25, 23";

export function normalizeHeroOverlayOpacity(value: unknown, fallback = 80) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function buildHeroOverlayStyle(opacity: number): CSSProperties {
  const normalizedOpacity = normalizeHeroOverlayOpacity(opacity) / 100;

  if (normalizedOpacity <= 0) {
    return { background: "transparent" };
  }

  const topOpacity = Math.max(0, normalizedOpacity - 0.12);
  const middleOpacity = normalizedOpacity;
  const bottomOpacity = Math.min(1, normalizedOpacity + 0.12);

  return {
    backgroundImage: `linear-gradient(to bottom, rgba(${HERO_OVERLAY_RGB}, ${topOpacity}), rgba(${HERO_OVERLAY_RGB}, ${middleOpacity}), rgba(${HERO_OVERLAY_RGB}, ${bottomOpacity}))`,
  };
}
