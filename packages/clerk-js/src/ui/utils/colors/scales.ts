import type { ColorScale, CssColorOrScale } from '@clerk/types';

import { hasModernColorSupport } from './cache';
import { ALPHA_VALUES, COLOR_SCALE, DARK_SHADES, LIGHT_SHADES, LIGHTNESS_CONFIG } from './constants';
import { legacyColors } from './legacy';
import { createEmptyColorScale, generateAlphaColorMix, getColorMix } from './utils';

/**
 * Modern CSS alpha scale generation
 */
function generateModernAlphaScale(baseColor: string): ColorScale<string> {
  const scale = createEmptyColorScale();

  COLOR_SCALE.forEach(shade => {
    scale[shade] = generateAlphaColorMix(baseColor, shade);
  });

  return scale as ColorScale<string>;
}

/**
 * Legacy HSLA alpha scale generation
 */
function generateLegacyAlphaScale(baseColor: string): ColorScale<string> {
  const scale = createEmptyColorScale();
  const parsedColor = legacyColors.toHslaColor(baseColor);
  const baseWithoutAlpha = legacyColors.setHslaAlpha(parsedColor, 0);

  COLOR_SCALE.forEach((shade, index) => {
    const alpha = ALPHA_VALUES[index] ?? 1;
    const alphaColor = legacyColors.setHslaAlpha(baseWithoutAlpha, alpha);
    scale[shade] = legacyColors.toHslaString(alphaColor);
  });

  return scale as ColorScale<string>;
}

/**
 * Modern CSS lightness scale generation
 */
function generateModernLightnessScale(baseColor: string): ColorScale<string> {
  const scale = createEmptyColorScale();

  COLOR_SCALE.forEach(shade => {
    scale[shade] = getColorMix(baseColor, shade);
  });

  return scale as ColorScale<string>;
}

/**
 * Legacy HSLA lightness scale generation
 */
function generateLegacyLightnessScale(baseColor: string): ColorScale<string> {
  const scale = createEmptyColorScale();
  const parsedColor = legacyColors.toHslaColor(baseColor);

  // Set the base 500 shade
  scale['500'] = legacyColors.toHslaString(parsedColor);

  // Calculate lightness steps
  const lightStep = (LIGHTNESS_CONFIG.TARGET_LIGHT - parsedColor.l) / LIGHT_SHADES.length;
  const darkStep = (parsedColor.l - LIGHTNESS_CONFIG.TARGET_DARK) / DARK_SHADES.length;

  // Generate light shades (lighter than base)
  LIGHT_SHADES.forEach((shade, index) => {
    const lightnessIncrease = (index + 1) * lightStep;
    const lightColor = legacyColors.changeHslaLightness(parsedColor, lightnessIncrease);
    scale[shade] = legacyColors.toHslaString(lightColor);
  });

  // Generate dark shades (darker than base)
  DARK_SHADES.forEach((shade, index) => {
    const lightnessDecrease = (index + 1) * darkStep * -1;
    const darkColor = legacyColors.changeHslaLightness(parsedColor, lightnessDecrease);
    scale[shade] = legacyColors.toHslaString(darkColor);
  });

  return scale as ColorScale<string>;
}

/**
 * Processes color input and validates it
 */
function processColorInput(
  color: string | ColorScale<string> | CssColorOrScale | undefined,
): { baseColor: string; userScale?: ColorScale<string> } | null {
  if (!color) return null;

  if (typeof color === 'string') {
    return { baseColor: color };
  }

  // If it's already a color scale object, extract the base color (500 shade)
  if (color['500']) {
    return {
      baseColor: color['500'],
      userScale: color as ColorScale<string>,
    };
  }

  return null;
}

/**
 * Merges user-defined colors with generated scale
 */
function mergeWithUserScale(generated: ColorScale<string>, userScale?: ColorScale<string>): ColorScale<string> {
  if (!userScale) return generated;

  return { ...generated, ...userScale };
}

/**
 * Unified alpha scale generator that automatically chooses between modern and legacy implementations
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with alpha variations
 */
export function generateAlphaScale(
  color: string | ColorScale<string> | CssColorOrScale | undefined,
): ColorScale<string> {
  const processed = processColorInput(color);
  if (!processed) {
    return createEmptyColorScale() as ColorScale<string>;
  }

  const { baseColor, userScale } = processed;

  // Generate scale using modern or legacy implementation
  const generated = hasModernColorSupport() ? generateModernAlphaScale(baseColor) : generateLegacyAlphaScale(baseColor);

  // Merge with user-provided colors if any
  return mergeWithUserScale(generated, userScale);
}

/**
 * Unified lightness scale generator that automatically chooses between modern and legacy implementations
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with lightness variations
 */
export function generateLightnessScale(
  color: string | ColorScale<string> | CssColorOrScale | undefined,
): ColorScale<string> {
  const processed = processColorInput(color);
  if (!processed) {
    return createEmptyColorScale() as ColorScale<string>;
  }

  const { baseColor, userScale } = processed;

  // Generate scale using modern or legacy implementation
  const generated = hasModernColorSupport()
    ? generateModernLightnessScale(baseColor)
    : generateLegacyLightnessScale(baseColor);

  // Merge with user-provided colors if any
  return mergeWithUserScale(generated, userScale);
}

/**
 * Direct access to modern scale generators (for testing or when modern CSS is guaranteed)
 */
export const modernScales = {
  generateAlphaScale: generateModernAlphaScale,
  generateLightnessScale: generateModernLightnessScale,
} as const;

/**
 * Direct access to legacy scale generators (for testing or compatibility)
 */
export const legacyScales = {
  generateAlphaScale: generateLegacyAlphaScale,
  generateLightnessScale: generateLegacyLightnessScale,
} as const;
