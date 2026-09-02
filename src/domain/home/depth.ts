/**
 * Art-directed depth slots, ordered to match the ten CSS composition slots.
 * The values are intentionally close together: depth should separate the
 * specimens without turning the background into an unreadable haze.
 */
export const heroDepthProfile = [
  0.92, // foreground focal point
  0.58, // midground, upper right
  0.76, // foreground, left
  0.18, // background, upper left
  0.42, // midground, upper centre
  0.26, // background, lower left
  0.34, // background, lower right
  0.62, // midground, right
  0.8, // foreground, lower centre
  0.3, // background, centre right
] as const;

export interface HeroDepthPresentation {
  scale: number;
  focusScale: number;
  opacity: number;
  focusOpacity: number;
  mutedOpacity: number;
  blurPx: number;
  focusBlurPx: number;
  brightness: number;
  focusBrightness: number;
  mutedBrightness: number;
  contrast: number;
  focusContrast: number;
  mutedContrast: number;
  parallaxX: number;
  parallaxY: number;
  zIndex: number;
  shadowY: number;
  shadowBlur: number;
  shadowAlpha: number;
}

function round(value: number, places = 3) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Derive all visual depth cues from one normalized depth value. Keeping this
 * mapping in one place prevents scale, sharpness, light, motion, and stacking
 * from drifting into contradictory per-slot styling.
 */
export function getHeroDepthPresentation(depth: number): HeroDepthPresentation {
  const normalized = Math.min(1, Math.max(0, depth));
  const scale = 0.9 + normalized * 0.16;
  const opacity = 0.68 + normalized * 0.26;
  const blurPx = (1 - normalized) * 0.9;
  const brightness = 0.9 + normalized * 0.12;
  const contrast = 0.95 + normalized * 0.12;

  return {
    scale: round(scale),
    focusScale: round(scale + 0.045),
    opacity: round(opacity),
    focusOpacity: round(Math.min(1, opacity + 0.06)),
    mutedOpacity: round(opacity * 0.64),
    blurPx: round(blurPx, 2),
    focusBlurPx: round(Math.max(0, blurPx - 0.55), 2),
    brightness: round(brightness),
    focusBrightness: round(Math.min(1.08, brightness + 0.06)),
    mutedBrightness: round(brightness * 0.96),
    contrast: round(contrast),
    focusContrast: round(Math.min(1.12, contrast + 0.06)),
    mutedContrast: round(contrast * 0.96),
    parallaxX: round(3 + normalized * 9, 2),
    parallaxY: round(2 + normalized * 7, 2),
    zIndex: 10 + Math.round(normalized * 30),
    shadowY: round(5 + normalized * 8, 2),
    shadowBlur: round(10 + normalized * 14, 2),
    shadowAlpha: round(0.22 + normalized * 0.24, 3),
  };
}
