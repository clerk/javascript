import type { ColorScale, CssColorOrAlphaScale, CssColorOrScale, HslaColor, HslaColorString } from '@clerk/types';

import { colors, generateAlphaScale, generateLightnessScale } from './colors';
import { applyScalePrefix } from './colors/utils';
import { cssSupports } from './cssSupports';

// Types
type InternalColorScale<T> = ColorScale<T> & Partial<Record<20, T>>;
type ColorShadeKey = keyof InternalColorScale<unknown>;
type WithPrefix<T extends Record<string, string>, Prefix extends string> = {
  [K in keyof T as `${Prefix}${K & string}`]: T[K];
};

// Constants
const LIGHT_SHADES: ColorShadeKey[] = ['25', '50', '100', '150', '200', '300', '400'];
const DARK_SHADES: ColorShadeKey[] = ['600', '700', '750', '800', '850', '900', '950'];
const ALL_SHADES: ColorShadeKey[] = [...LIGHT_SHADES.reverse(), '500', ...DARK_SHADES];

const TARGET_LIGHTNESS = {
  LIGHTEST: 97, // For 50 shade
  DARKEST: 12, // For 900 shade
} as const;

const ALPHA_VALUES = [0.02, 0.03, 0.07, 0.11, 0.15, 0.28, 0.41, 0.53, 0.62, 0.73, 0.78, 0.81, 0.84, 0.87, 0.92];

// Utility functions
export function createEmptyColorScale<T = undefined>(): InternalColorScale<T | undefined> {
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

function validateCompleteScale(scale: Record<string, any>): void {
  const missingShades = ALL_SHADES.filter(shade => !(shade in scale));
  if (missingShades.length > 0) {
    throw new Error(
      `Missing required shades: ${missingShades.join(', ')}. All shades must be provided: ${ALL_SHADES.join(', ')}`,
    );
  }
}

function validateBaseShade(scale: Record<string, any>): void {
  if (!scale['500']) {
    throw new Error('The 500 shade is required as the base color for scale generation');
  }
}

function convertToHslaScale(colorScale: Record<string, string>): InternalColorScale<HslaColor> {
  const result: Record<string, HslaColor> = {};

  for (const shade of ALL_SHADES) {
    if (colorScale[shade]) {
      result[shade] = colors.toHslaColor(colorScale[shade]);
    }
  }

  return result as InternalColorScale<HslaColor>;
}

function prefixAndStringifyScale<Prefix extends string>(
  scale: InternalColorScale<HslaColor | undefined>,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> {
  const result = {} as WithPrefix<InternalColorScale<HslaColorString>, Prefix>;

  for (const shade of ALL_SHADES) {
    const color = scale[shade];
    if (color) {
      (result as any)[prefix + shade] = colors.toHslaString(color);
    }
  }

  return result;
}

// Modern CSS-based alpha scale generation
function generateModernAlphaScale(baseColor: string): ColorScale<string> {
  // Use the existing modern alpha scale utility
  return generateAlphaScale(baseColor);
}

// Legacy HSLA-based scale generation
function generateLegacyLightnessScale(baseColor: HslaColor): InternalColorScale<HslaColor> {
  const scale: Record<string, HslaColor> = {
    '500': baseColor,
  };

  // Calculate lightness steps for light and dark shades
  const lightStep = (TARGET_LIGHTNESS.LIGHTEST - baseColor.l) / LIGHT_SHADES.length;
  const darkStep = (baseColor.l - TARGET_LIGHTNESS.DARKEST) / DARK_SHADES.length;

  // Generate light shades (lighter than base)
  LIGHT_SHADES.forEach((shade, index) => {
    const lightnessIncrease = (index + 1) * lightStep;
    scale[shade] = colors.changeHslaLightness(baseColor, lightnessIncrease);
  });

  // Generate dark shades (darker than base)
  DARK_SHADES.forEach((shade, index) => {
    const lightnessDecrease = (index + 1) * darkStep * -1;
    scale[shade] = colors.changeHslaLightness(baseColor, lightnessDecrease);
  });

  return scale as InternalColorScale<HslaColor>;
}

function generateLegacyAlphaScale(baseColor: HslaColor): InternalColorScale<HslaColor> {
  const scale: Record<string, HslaColor> = {};
  const baseWithoutAlpha = colors.setHslaAlpha(baseColor, 0);

  ALL_SHADES.forEach((shade, index) => {
    const alpha = ALPHA_VALUES[index] ?? 1;
    scale[shade] = colors.setHslaAlpha(baseWithoutAlpha, alpha);
  });

  return scale as InternalColorScale<HslaColor>;
}

function mergeUserDefinedWithGenerated(
  generated: InternalColorScale<HslaColor>,
  userDefined: InternalColorScale<HslaColor>,
): InternalColorScale<HslaColor> {
  const merged: Record<string, HslaColor> = {};

  for (const shade of ALL_SHADES) {
    const userColor = userDefined[shade];
    const generatedColor = generated[shade];
    // At least one should exist, prefer user-defined
    if (userColor) {
      merged[shade] = userColor;
    } else if (generatedColor) {
      merged[shade] = generatedColor;
    }
  }

  return merged as InternalColorScale<HslaColor>;
}

function processColorInput(
  colorInput: string | Record<string, string>,
  requireComplete: boolean = false,
): InternalColorScale<HslaColor> {
  if (typeof colorInput === 'string') {
    // Single color provided - create scale with only 500 shade
    return { '500': colors.toHslaColor(colorInput) } as InternalColorScale<HslaColor>;
  }

  // Object with multiple shades provided
  if (requireComplete) {
    validateCompleteScale(colorInput);
  } else {
    validateBaseShade(colorInput);
  }

  return convertToHslaScale(colorInput);
}

// Main exported functions
export const colorOptionToHslaAlphaScale = <Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'string') {
    // For single color input, check if we can use modern CSS first
    if (cssSupports.colorMix()) {
      // Use modern CSS directly - no HSLA conversion needed
      const modernScale = generateModernAlphaScale(colorOption);
      return applyScalePrefix(modernScale, prefix) as unknown as WithPrefix<
        InternalColorScale<HslaColorString>,
        Prefix
      >;
    }

    // Fall back to HSLA approach - only parse if modern CSS is not supported
    const userScale = processColorInput(colorOption, false);
    const finalScale = generateLegacyAlphaScale(userScale['500']);
    return prefixAndStringifyScale(finalScale, prefix);
  } else {
    // For alpha scales, we require all shades to be provided or generate from single color
    const userScale = processColorInput(colorOption, true);
    return prefixAndStringifyScale(userScale, prefix);
  }
};

export const colorOptionToHslaLightnessScale = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'string') {
    // For single color input, check if we can use modern CSS first
    if (cssSupports.colorMix() || cssSupports.relativeColorSyntax()) {
      // Use modern CSS directly - no HSLA conversion needed
      const modernScale = generateLightnessScale(colorOption);
      return applyScalePrefix(modernScale, prefix) as unknown as WithPrefix<
        InternalColorScale<HslaColorString>,
        Prefix
      >;
    }

    // Fall back to HSLA approach - only parse if modern CSS is not supported
    const userScale = processColorInput(colorOption, false);
    const baseColor = userScale['500'];
    const generatedScale = generateLegacyLightnessScale(baseColor);
    const finalScale = mergeUserDefinedWithGenerated(generatedScale, userScale);
    return prefixAndStringifyScale(finalScale, prefix);
  } else {
    // User provided partial or complete scale - process normally
    const userScale = processColorInput(colorOption, false);
    const baseColor = userScale['500'];

    if (!baseColor) {
      throw new Error('Base color (500 shade) is required for lightness scale generation');
    }

    // Generate complete scale from base color using legacy HSLA approach
    const generatedScale = generateLegacyLightnessScale(baseColor);

    // Merge user-provided shades with generated ones (user takes precedence)
    const finalScale = mergeUserDefinedWithGenerated(generatedScale, userScale);

    return prefixAndStringifyScale(finalScale, prefix);
  }
};
