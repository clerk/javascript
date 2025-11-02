import { clerkCssVar } from '../utils/cssVariables';

const SPACING_BASE_UNIT = '1rem';
const SPACING_MULTIPLIER = 0.25; // ((num / 0.5) * 0.125)

const baseSpaceUnits = Object.freeze({
  none: '0',
  xxs: '0.5px',
  px: '1px',
} as const);

/**
 * Spacing scale configuration
 * Maps scale keys to their rem values and multipliers for dynamic calculation
 */
const spacingScale = Object.freeze({
  '0x25': { rem: '0.0625rem', multiplier: 0.25 },
  '0x5': { rem: '0.125rem', multiplier: 0.5 },
  '1': { rem: '0.25rem', multiplier: 1 },
  '1x5': { rem: '0.375rem', multiplier: 1.5 },
  '2': { rem: '0.5rem', multiplier: 2 },
  '2x5': { rem: '0.625rem', multiplier: 2.5 },
  '3': { rem: '0.75rem', multiplier: 3 },
  '3x25': { rem: '0.8125rem', multiplier: 3.25 },
  '3x5': { rem: '0.875rem', multiplier: 3.5 },
  '4': { rem: '1rem', multiplier: 4 },
  '4x25': { rem: '1.0625rem', multiplier: 4.25 },
  '4x5': { rem: '1.125rem', multiplier: 4.5 },
  '5': { rem: '1.25rem', multiplier: 5 },
  '5x5': { rem: '1.375rem', multiplier: 5.5 },
  '6': { rem: '1.5rem', multiplier: 6 },
  '7': { rem: '1.75rem', multiplier: 7 },
  '7x5': { rem: '1.875rem', multiplier: 7.5 },
  '8': { rem: '2rem', multiplier: 8 },
  '8x5': { rem: '2.125rem', multiplier: 8.5 },
  '8x75': { rem: '2.1875rem', multiplier: 8.75 },
  '9': { rem: '2.25rem', multiplier: 9 },
  '10': { rem: '2.5rem', multiplier: 10 },
  '12': { rem: '3rem', multiplier: 12 },
  '13': { rem: '3.5rem', multiplier: 13 },
  '16': { rem: '4rem', multiplier: 16 },
  '17': { rem: '4.25rem', multiplier: 17 },
  '20': { rem: '5rem', multiplier: 20 },
  '24': { rem: '6rem', multiplier: 24 },
  '28': { rem: '7rem', multiplier: 28 },
  '32': { rem: '8rem', multiplier: 32 },
  '36': { rem: '9rem', multiplier: 36 },
  '40': { rem: '10rem', multiplier: 40 },
  '44': { rem: '11rem', multiplier: 44 },
  '48': { rem: '12rem', multiplier: 48 },
  '52': { rem: '13rem', multiplier: 52 },
  '56': { rem: '14rem', multiplier: 56 },
  '57': { rem: '14.25rem', multiplier: 57 },
  '60': { rem: '15rem', multiplier: 60 },
  '66': { rem: '16.5rem', multiplier: 66 },
  '94': { rem: '23.5rem', multiplier: 94 },
  '100': { rem: '25rem', multiplier: 100 },
  '108': { rem: '27rem', multiplier: 108 },
  '120': { rem: '30rem', multiplier: 120 },
  '140': { rem: '35rem', multiplier: 140 },
  '160': { rem: '40rem', multiplier: 160 },
  '176': { rem: '44rem', multiplier: 176 },
  '220': { rem: '55rem', multiplier: 220 },
} as const);

type SpacingScaleKey = keyof typeof spacingScale;

const dynamicSpaceUnitsDefaultVar = clerkCssVar('spacing', SPACING_BASE_UNIT);

/**
 * Calculates a dynamic spacing unit based on the CSS variable
 * @param multiplier - The multiplier to apply to the base spacing unit
 * @returns CSS calc() expression for dynamic spacing
 */
const calcDynamicSpaceUnits = (multiplier: number): string => {
  // Special case for the base unit (4 = 1rem)
  if (multiplier === 4) {
    return dynamicSpaceUnitsDefaultVar;
  }
  return `calc(${dynamicSpaceUnitsDefaultVar} * ${multiplier * SPACING_MULTIPLIER})`;
};

/**
 * Type helper to extract rem values while preserving literal types
 */
type ExtractRemValues<T> = {
  readonly [K in keyof T]: T[K] extends { rem: infer R } ? R : never;
};

/**
 * Generate static spacing units from the spacing scale
 * Uses mapped types to preserve literal string types for better intellisense
 */
const spaceUnits = Object.freeze({
  '0x25': spacingScale['0x25'].rem,
  '0x5': spacingScale['0x5'].rem,
  '1': spacingScale['1'].rem,
  '1x5': spacingScale['1x5'].rem,
  '2': spacingScale['2'].rem,
  '2x5': spacingScale['2x5'].rem,
  '3': spacingScale['3'].rem,
  '3x25': spacingScale['3x25'].rem,
  '3x5': spacingScale['3x5'].rem,
  '4': spacingScale['4'].rem,
  '4x25': spacingScale['4x25'].rem,
  '4x5': spacingScale['4x5'].rem,
  '5': spacingScale['5'].rem,
  '5x5': spacingScale['5x5'].rem,
  '6': spacingScale['6'].rem,
  '7': spacingScale['7'].rem,
  '7x5': spacingScale['7x5'].rem,
  '8': spacingScale['8'].rem,
  '8x5': spacingScale['8x5'].rem,
  '8x75': spacingScale['8x75'].rem,
  '9': spacingScale['9'].rem,
  '10': spacingScale['10'].rem,
  '12': spacingScale['12'].rem,
  '13': spacingScale['13'].rem,
  '16': spacingScale['16'].rem,
  '17': spacingScale['17'].rem,
  '20': spacingScale['20'].rem,
  '24': spacingScale['24'].rem,
  '28': spacingScale['28'].rem,
  '32': spacingScale['32'].rem,
  '36': spacingScale['36'].rem,
  '40': spacingScale['40'].rem,
  '44': spacingScale['44'].rem,
  '48': spacingScale['48'].rem,
  '52': spacingScale['52'].rem,
  '56': spacingScale['56'].rem,
  '57': spacingScale['57'].rem,
  '60': spacingScale['60'].rem,
  '66': spacingScale['66'].rem,
  '94': spacingScale['94'].rem,
  '100': spacingScale['100'].rem,
  '108': spacingScale['108'].rem,
  '120': spacingScale['120'].rem,
  '140': spacingScale['140'].rem,
  '160': spacingScale['160'].rem,
  '176': spacingScale['176'].rem,
  '220': spacingScale['220'].rem,
} as const) satisfies ExtractRemValues<typeof spacingScale>;

/**
 * Generate dynamic spacing units from the spacing scale
 */
const dynamicSpaceUnits = Object.freeze(
  Object.fromEntries(
    Object.entries(spacingScale).map(([key, { multiplier }]) => [key, calcDynamicSpaceUnits(multiplier)]),
  ),
) as Record<SpacingScaleKey, string>;

/**
 * Complete spacing scale combining base units and dynamic spacing
 * Used for responsive spacing that adapts to the CSS variable
 */
const space = Object.freeze({
  ...baseSpaceUnits,
  ...dynamicSpaceUnits,
} as const);

/**
 * Static sizes combining base units and fixed spacing values
 * Used for non-responsive sizing
 */
const sizes = Object.freeze({
  ...baseSpaceUnits,
  ...spaceUnits,
} as const);

/**
 * Border radius scale with CSS variables for theming
 */
export const BORDER_RADIUS_SCALE_RATIOS = Object.freeze({
  sm: '2 / 3', // 0.66
  md: '1', // 1.0
  lg: '4 / 3', // 1.33
  xl: '2', // 2.0
} as const);

const radiiDefaultVar = clerkCssVar('border-radius', '0.375rem');

const radii = Object.freeze({
  none: '0px',
  circle: '50%',
  avatar: clerkCssVar('border-radius-avatar', radiiDefaultVar),
  sm: clerkCssVar('border-radius-sm', `calc(${radiiDefaultVar} * ${BORDER_RADIUS_SCALE_RATIOS.sm})`), // Use fraction for precision
  md: clerkCssVar('border-radius-md', radiiDefaultVar),
  lg: clerkCssVar('border-radius-lg', `calc(${radiiDefaultVar} * ${BORDER_RADIUS_SCALE_RATIOS.lg})`), // Use fraction for precision
  xl: clerkCssVar('border-radius-xl', `calc(${radiiDefaultVar} * ${BORDER_RADIUS_SCALE_RATIOS.xl})`),
  halfHeight: '99999px',
} as const);

/**
 * Used by the space scale generation helpers.
 * These keys should always match the spacing scale
 */
const spaceScaleKeys = Object.keys(spacingScale) as SpacingScaleKey[];

export { sizes, space, radii, spaceScaleKeys };
