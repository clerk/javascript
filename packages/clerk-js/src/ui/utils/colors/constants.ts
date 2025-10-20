/**
 * Shared constants for color utilities
 */

import type { ColorScale } from '@clerk/shared/types';

// Types
export type ColorShade = 25 | 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 750 | 800 | 850 | 900 | 950;
export type ColorShadeKey = keyof ColorScale<any>;

// Core color scale definition
export const COLOR_SCALE: readonly ColorShade[] = [
  25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950,
] as const;

// Shade groupings for scale generation
export const LIGHT_SHADES: ColorShadeKey[] = ['400', '300', '200', '150', '100', '50', '25'];
export const DARK_SHADES: ColorShadeKey[] = ['600', '700', '750', '800', '850', '900', '950'];
export const ALL_SHADES: ColorShadeKey[] = [...LIGHT_SHADES, '500', ...DARK_SHADES];

// Lightness configuration for scale generation
export const LIGHTNESS_CONFIG = {
  TARGET_LIGHT: 97, // Target lightness for 50 shade
  TARGET_DARK: 12, // Target lightness for 900 shade
  LIGHT_STEPS: 7, // Number of light shades
  DARK_STEPS: 7, // Number of dark shades
} as const;

// Alpha percentages for color-mix generation
export const ALPHA_PERCENTAGES: Record<ColorShade, number> = {
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

export const ALPHA_VALUES = Object.values(ALPHA_PERCENTAGES)
  .map(v => v / 100)
  .sort();

// Lightness mix data for color-mix generation
export const LIGHTNESS_MIX_DATA: Record<ColorShade, { mixColor: 'white' | 'black' | null; percentage: number }> = {
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

// Relative color syntax step configuration
export const RELATIVE_SHADE_STEPS: Record<number, number> = {
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

// Color bounds for validation and clamping
export const COLOR_BOUNDS = {
  rgb: { min: 0, max: 255 },
  alpha: { min: 0, max: 1 },
  hue: { min: 0, max: 360 },
  percentage: { min: 0, max: 100 },
} as const;

// Modern CSS utility constants
export const MODERN_CSS_LIMITS = {
  MAX_LIGHTNESS_MIX: 95, // Maximum percentage for color-mix with white
  MIN_ALPHA_PERCENTAGE: 5, // Minimum opacity for transparent color-mix
  MAX_LIGHTNESS_ADJUSTMENT: 30, // Maximum lightness adjustment in color-mix
  MIN_LIGHTNESS_FLOOR: 95, // Minimum lightness floor for very light colors
  LIGHTNESS_MULTIPLIER: 2, // Multiplier for lightness adjustments
  MIX_MULTIPLIER: 4, // Multiplier for mix percentage calculations
} as const;
