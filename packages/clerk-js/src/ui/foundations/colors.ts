import { colors as colorUtils } from '../utils/colors';
import { colorOptionToThemedAlphaScale, colorOptionToThemedLightnessScale } from '../utils/colors/scales';
import { clerkCssVar } from '../utils/cssVariables';

const whiteAlpha = Object.freeze({
  whiteAlpha25: 'hsla(0, 0%, 100%, 0.02)',
  whiteAlpha50: 'hsla(0, 0%, 100%, 0.03)',
  whiteAlpha100: 'hsla(0, 0%, 100%, 0.07)',
  whiteAlpha150: 'hsla(0, 0%, 100%, 0.11)',
  whiteAlpha200: 'hsla(0, 0%, 100%, 0.15)',
  whiteAlpha300: 'hsla(0, 0%, 100%, 0.28)',
  whiteAlpha400: 'hsla(0, 0%, 100%, 0.41)',
  whiteAlpha500: 'hsla(0, 0%, 100%, 0.53)',
  whiteAlpha600: 'hsla(0, 0%, 100%, 0.62)',
  whiteAlpha700: 'hsla(0, 0%, 100%, 0.73)',
  whiteAlpha750: 'hsla(0, 0%, 100%, 0.78)',
  whiteAlpha800: 'hsla(0, 0%, 100%, 0.81)',
  whiteAlpha850: 'hsla(0, 0%, 100%, 0.84)',
  whiteAlpha900: 'hsla(0, 0%, 100%, 0.87)',
  whiteAlpha950: 'hsla(0, 0%, 100%, 0.92)',
} as const);

type LightnessScale<T extends string> = NonNullable<ReturnType<typeof colorOptionToThemedLightnessScale<T>>>;
type AlphaScale<T extends string> = NonNullable<ReturnType<typeof colorOptionToThemedAlphaScale<T>>>;

/**
 * Color scale generation with clerkCssVar
 *
 * These functions will never return undefined because:
 * 1. clerkCssVar always provides a fallback value (e.g., 'var(--clerk-color-danger, #EF4444)')
 * 2. The fallback ensures a valid color string is always passed to the scale generation functions
 * 3. Valid color strings always produce complete color scales
 *
 * Therefore, it's safe to assert these as NonNullable.
 */

const defaultColorNeutral = clerkCssVar('color-neutral', '#000000');

const dangerScale = colorOptionToThemedLightnessScale(
  clerkCssVar('color-danger', '#EF4444'),
  'danger',
) as LightnessScale<'danger'>;
const primaryScale = colorOptionToThemedLightnessScale(
  clerkCssVar('color-primary', '#2F3037'),
  'primary',
) as LightnessScale<'primary'>;
const successScale = colorOptionToThemedLightnessScale(
  clerkCssVar('color-success', '#22C543'),
  'success',
) as LightnessScale<'success'>;
const warningScale = colorOptionToThemedLightnessScale(
  clerkCssVar('color-warning', '#F36B16'),
  'warning',
) as LightnessScale<'warning'>;

const dangerAlphaScale = colorOptionToThemedAlphaScale(
  clerkCssVar('color-danger', '#EF4444'),
  'dangerAlpha',
) as AlphaScale<'dangerAlpha'>;
const neutralAlphaScale = colorOptionToThemedAlphaScale(
  defaultColorNeutral,
  'neutralAlpha',
) as AlphaScale<'neutralAlpha'>;
const primaryAlphaScale = colorOptionToThemedAlphaScale(
  clerkCssVar('color-primary', '#2F3037'),
  'primaryAlpha',
) as AlphaScale<'primaryAlpha'>;
const successAlphaScale = colorOptionToThemedAlphaScale(
  clerkCssVar('color-success', '#22C543'),
  'successAlpha',
) as AlphaScale<'successAlpha'>;
const warningAlphaScale = colorOptionToThemedAlphaScale(
  clerkCssVar('color-warning', '#F36B16'),
  'warningAlpha',
) as AlphaScale<'warningAlpha'>;

const borderAlphaScale = colorOptionToThemedAlphaScale(
  clerkCssVar('color-border', defaultColorNeutral),
  'borderAlpha',
) as AlphaScale<'borderAlpha'>;

const colorForeground = clerkCssVar('color-foreground', '#212126');
const colorMutedForeground = clerkCssVar(
  'color-muted-foreground',
  colorUtils.makeTransparent(colorForeground, 0.35) || '#747686',
);

const colors = Object.freeze({
  avatarBorder: neutralAlphaScale.neutralAlpha200,
  avatarBackground: neutralAlphaScale.neutralAlpha400,
  colorModalBackdrop:
    colorUtils.makeTransparent(clerkCssVar('color-modal-backdrop', defaultColorNeutral), 0.27) ||
    neutralAlphaScale.neutralAlpha700,
  colorBackground: clerkCssVar('color-background', 'white'),
  colorInput: clerkCssVar('color-input', 'white'),
  colorForeground,
  colorMutedForeground,
  colorMuted: undefined,
  colorRing:
    colorUtils.makeTransparent(clerkCssVar('color-ring', defaultColorNeutral), 0.85) ||
    neutralAlphaScale.neutralAlpha200,
  colorInputForeground: clerkCssVar('color-input-foreground', '#131316'),
  colorPrimaryForeground: clerkCssVar('color-primary-foreground', 'white'),
  colorShimmer: clerkCssVar('color-shimmer', 'rgba(255, 255, 255, 0.36)'),
  transparent: 'transparent',
  white: 'white',
  black: 'black',
  ...neutralAlphaScale,
  ...whiteAlpha,
  ...primaryScale,
  primaryHover: colorUtils.adjustForLightness(primaryScale.primary500),
  ...primaryAlphaScale,
  ...dangerScale,
  ...dangerAlphaScale,
  ...warningScale,
  ...warningAlphaScale,
  ...successScale,
  ...successAlphaScale,
  ...borderAlphaScale,
} as const);

export { colors, neutralAlphaScale as neutralAlpha, whiteAlpha };
