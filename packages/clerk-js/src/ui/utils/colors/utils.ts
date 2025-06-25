import type { ColorScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { memoizedColorGenerators } from './cache';
import type { ColorShade } from './constants';
import { ALPHA_PERCENTAGES, LIGHTNESS_CONFIG, LIGHTNESS_MIX_DATA, RELATIVE_SHADE_STEPS } from './constants';

// Core utility functions (now using memoized versions for better performance)
export function createColorMix(baseColor: string, mixColor: string, percentage: number): string {
  return memoizedColorGenerators.colorMix(baseColor, mixColor, percentage);
}

export function createAlphaColorMix(color: string, alphaPercentage: number): string {
  return memoizedColorGenerators.alphaColorMix(color, alphaPercentage);
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
