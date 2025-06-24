import type { ColorScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';

// Types
export type ColorShade = 25 | 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 750 | 800 | 850 | 900 | 950;

// Constants
export const COLOR_SCALE: readonly ColorShade[] = [
  25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950,
] as const;

const LIGHTNESS_CONFIG = {
  TARGET_LIGHT: 97, // Target lightness for 50 shade
  TARGET_DARK: 12, // Target lightness for 900 shade
  LIGHT_STEPS: 7, // Number of light shades
  DARK_STEPS: 7, // Number of dark shades
} as const;

const LIGHTNESS_MIX_DATA: Record<ColorShade, { mixColor: 'white' | 'black' | null; percentage: number }> = {
  25: { mixColor: 'white', percentage: 85 },
  50: { mixColor: 'white', percentage: 80 },
  100: { mixColor: 'white', percentage: 68 },
  150: { mixColor: 'white', percentage: 55 },
  200: { mixColor: 'white', percentage: 40 },
  300: { mixColor: 'white', percentage: 26 },
  400: { mixColor: 'white', percentage: 16 },
  500: { mixColor: null, percentage: 0 },
  600: { mixColor: 'black', percentage: 12 },
  700: { mixColor: 'black', percentage: 22 },
  750: { mixColor: 'black', percentage: 30 },
  800: { mixColor: 'black', percentage: 44 },
  850: { mixColor: 'black', percentage: 55 },
  900: { mixColor: 'black', percentage: 65 },
  950: { mixColor: 'black', percentage: 75 },
} as const;

const ALPHA_PERCENTAGES: Record<ColorShade, number> = {
  25: 2,
  50: 3,
  100: 7,
  150: 11,
  200: 15,
  300: 28,
  400: 41,
  500: 53,
  600: 62,
  700: 73,
  750: 78,
  800: 81,
  850: 84,
  900: 87,
  950: 92,
} as const;

const RELATIVE_SHADE_STEPS: Record<number, number> = {
  // Light shades (lighter than 500)
  400: 1,
  300: 2,
  200: 3,
  150: 4,
  100: 5,
  50: 6,
  25: 7,
  // Dark shades (darker than 500)
  600: 1,
  700: 2,
  750: 3,
  800: 4,
  850: 5,
  900: 6,
  950: 7,
} as const;

// Core utility functions
export function createColorMix(baseColor: string, mixColor: string, percentage: number): string {
  return `color-mix(in srgb, ${baseColor}, ${mixColor} ${percentage}%)`;
}

export function createAlphaColorMix(color: string, alphaPercentage: number): string {
  return createColorMix('transparent', color, alphaPercentage);
}

// Feature-specific generators
export function generateRelativeColorSyntax(color: string, shade: ColorShade): string {
  if (shade === 500) return color;

  const steps = RELATIVE_SHADE_STEPS[shade];
  if (!steps) return color;

  const { TARGET_LIGHT, TARGET_DARK, LIGHT_STEPS, DARK_STEPS } = LIGHTNESS_CONFIG;

  // Light shades (25-400)
  if (shade < 500) {
    return `hsl(from ${color} h s calc(l + (${steps} * ((${TARGET_LIGHT} - l) / ${LIGHT_STEPS}))))`;
  }

  // Dark shades (600-950)
  return `hsl(from ${color} h s calc(l - (${steps} * ((l - ${TARGET_DARK}) / ${DARK_STEPS}))))`;
}

export function generateColorMixSyntax(color: string, shade: ColorShade): string {
  if (shade === 500) return color;

  const mixData = LIGHTNESS_MIX_DATA[shade];
  if (!mixData.mixColor) return color;

  return createColorMix(color, mixData.mixColor, mixData.percentage);
}

export function generateAlphaColorMix(color: string, shade: ColorShade): string {
  const alphaPercentage = ALPHA_PERCENTAGES[shade];
  return createAlphaColorMix(color, alphaPercentage);
}

// Feature detection and selection
export function getColorMix(color: string, shade: ColorShade): string {
  if (shade === 500) return color;

  if (cssSupports.relativeColorSyntax()) {
    return generateRelativeColorSyntax(color, shade);
  }

  if (cssSupports.colorMix()) {
    return generateColorMixSyntax(color, shade);
  }

  return color;
}

// Scale utilities
export function createEmptyColorScale(): ColorScale<string | undefined> {
  return {
    '25': undefined,
    '50': undefined,
    '100': undefined,
    '150': undefined,
    '200': undefined,
    '300': undefined,
    '400': undefined,
    '500': undefined,
    '600': undefined,
    '700': undefined,
    '750': undefined,
    '800': undefined,
    '850': undefined,
    '900': undefined,
    '950': undefined,
  };
}

export function applyScalePrefix<Prefix extends string>(
  scale: ColorScale<string | undefined>,
  prefix: Prefix,
): Record<`${Prefix}${keyof ColorScale<string>}`, string> {
  const result = {} as Record<`${Prefix}${keyof ColorScale<string>}`, string>;

  for (const [shade, color] of Object.entries(scale)) {
    if (color !== undefined) {
      (result as any)[prefix + shade] = color;
    }
  }

  return result;
}

// Convenience functions for simple color mixing
export function simpleColorMix(colorOne: string, colorTwo: string): string {
  return `color-mix(in srgb, ${colorOne}, ${colorTwo})`;
}
