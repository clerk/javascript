import type { ColorScale, CssColorOrAlphaScale, CssColorOrScale, HslaColorString } from '@clerk/shared/types';

import { cssSupports } from '../cssSupports';
import { ALL_SHADES, ALPHA_VALUES, COLOR_SCALE, DARK_SHADES, LIGHT_SHADES, LIGHTNESS_CONFIG } from './constants';
import { colors as legacyColors } from './legacy';
import { createEmptyColorScale, generateAlphaColorMix, getSupportedColorVariant } from './utils';

// Types for themed scales
type InternalColorScale<T> = ColorScale<T> & Partial<Record<20, T>>;
type WithPrefix<T extends Record<string, string>, Prefix extends string> = {
  [K in keyof T as `${Prefix}${K & string}`]: T[K];
};

/**
 * Apply a prefix to a color scale
 * @param scale - The color scale to apply the prefix to
 * @param prefix - The prefix to apply
 * @returns The color scale with the prefix applied
 */
function applyScalePrefix<Prefix extends string>(
  scale: ColorScale<string | undefined>,
  prefix: Prefix,
): Record<`${Prefix}${keyof ColorScale<string>}`, string> {
  const result: Record<string, string> = {};

  for (const [shade, color] of Object.entries(scale)) {
    if (color !== undefined) {
      result[prefix + shade] = color;
    }
  }

  return result as Record<`${Prefix}${keyof ColorScale<string>}`, string>;
}

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
    scale[shade] = getSupportedColorVariant(baseColor, shade);
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
  if (!color) {
    return null;
  }

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

  // If it's an object, check if it has any valid shade keys
  if (typeof color === 'object') {
    const hasValidShadeKeys = ALL_SHADES.some((shade: keyof ColorScale<string>) => color[shade]);

    if (hasValidShadeKeys && !color['500']) {
      // Has valid shade keys but missing 500 - this is an error
      throw new Error('You need to provide at least the 500 shade');
    }

    // No valid shade keys - treat as invalid input
    if (!hasValidShadeKeys) {
      return null;
    }
  }

  return null;
}

/**
 * Merges user-defined colors with generated scale
 */
function mergeWithUserScale(generated: ColorScale<string>, userScale?: ColorScale<string>): ColorScale<string> {
  if (!userScale) {
    return generated;
  }

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
  const generated = cssSupports.modernColor()
    ? generateModernAlphaScale(baseColor)
    : generateLegacyAlphaScale(baseColor);

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
  const generated = cssSupports.modernColor()
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

/**
 * Converts a color scale to CSS color strings
 * Works with both modern CSS (color-mix, relative colors) and legacy HSLA
 */
function convertScaleToCssStrings(scale: ColorScale<string>): ColorScale<HslaColorString> {
  const result: Partial<ColorScale<HslaColorString>> = {};

  for (const [shade, color] of Object.entries(scale)) {
    if (color && color !== undefined) {
      // For modern CSS color-mix values, we keep them as-is since they're already valid CSS
      // For legacy HSLA values, they're already in HSLA format
      result[shade as keyof ColorScale<string>] = color as HslaColorString;
    }
  }

  return result as ColorScale<HslaColorString>;
}

/**
 * Applies prefix to a color scale and converts to CSS color strings
 */
function prefixAndConvertScale<Prefix extends string>(
  scale: ColorScale<string>,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> {
  const cssScale = convertScaleToCssStrings(scale);
  return applyScalePrefix(cssScale, prefix) as unknown as WithPrefix<InternalColorScale<HslaColorString>, Prefix>;
}

/**
 * Converts a color option to a themed alpha scale with prefix
 * Returns CSS color values (modern color-mix/relative colors or legacy HSLA)
 * @param colorOption - Color input (string or alpha scale object)
 * @param prefix - Prefix to apply to scale keys
 * @returns Prefixed CSS color scale or undefined
 */
export const colorOptionToThemedAlphaScale = <Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  // Generate alpha scale using the unified scale generator
  const scale = generateAlphaScale(colorOption);

  // Convert to CSS strings and apply prefix
  return prefixAndConvertScale(scale, prefix);
};

/**
 * Converts a color option to a themed lightness scale with prefix
 * Returns CSS color values (modern color-mix/relative colors or legacy HSLA)
 * @param colorOption - Color input (string or lightness scale object)
 * @param prefix - Prefix to apply to scale keys
 * @returns Prefixed CSS color scale or undefined
 */
export const colorOptionToThemedLightnessScale = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  // Generate lightness scale using the unified scale generator
  const scale = generateLightnessScale(colorOption);

  // Convert to CSS strings and apply prefix
  return prefixAndConvertScale(scale, prefix);
};
