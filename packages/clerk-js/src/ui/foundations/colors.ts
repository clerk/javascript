import { colors as colorUtils } from '../utils/colors';
import { colorOptionToThemedAlphaScale, colorOptionToThemedLightnessScale } from '../utils/colors/scales';
import { clerkCssVar } from '../utils/cssVariables';

export const whiteAlpha = Object.freeze({
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

const dangerScale = colorOptionToThemedLightnessScale(clerkCssVar('color-danger', '#EF4444'), 'danger');
const primaryScale = colorOptionToThemedLightnessScale(clerkCssVar('color-primary', '#2F3037'), 'primary');
const successScale = colorOptionToThemedLightnessScale(clerkCssVar('color-success', '#22C543'), 'success');
const warningScale = colorOptionToThemedLightnessScale(clerkCssVar('color-warning', '#F36B16'), 'warning');

const dangerAlphaScale = colorOptionToThemedAlphaScale(clerkCssVar('color-danger', '#EF4444'), 'dangerAlpha');
const neutralAlphaScale = colorOptionToThemedAlphaScale(clerkCssVar('color-neutral', '#000000'), 'neutralAlpha');
const primaryAlphaScale = colorOptionToThemedAlphaScale(clerkCssVar('color-primary', '#2F3037'), 'primaryAlpha');
const successAlphaScale = colorOptionToThemedAlphaScale(clerkCssVar('color-success', '#22C543'), 'successAlpha');
const warningAlphaScale = colorOptionToThemedAlphaScale(clerkCssVar('color-warning', '#F36B16'), 'warningAlpha');

export const colors = Object.freeze({
  avatarBorder: neutralAlphaScale?.neutralAlpha200,
  avatarBackground: neutralAlphaScale?.neutralAlpha400,
  modalBackdrop: neutralAlphaScale?.neutralAlpha700,
  ...neutralAlphaScale,
  ...whiteAlpha,
  colorBackground: clerkCssVar('color-background', 'white'),
  colorInputBackground: clerkCssVar('color-input-background', 'white'),
  colorText: clerkCssVar('color-text', '#212126'),
  colorTextSecondary: clerkCssVar('color-text-secondary', '#747686'),
  colorInputText: clerkCssVar('color-input-text', '#131316'),
  colorTextOnPrimaryBackground: clerkCssVar('color-text-on-primary-background', 'white'),
  colorShimmer: clerkCssVar('color-shimmer', 'rgba(255, 255, 255, 0.36)'),
  transparent: 'transparent',
  white: 'white',
  black: 'black',
  ...primaryScale,
  primaryHover: colorUtils.adjustForLightness(primaryScale?.primary500),
  ...primaryAlphaScale,
  ...dangerScale,
  ...dangerAlphaScale,
  ...warningScale,
  ...warningAlphaScale,
  ...successScale,
  ...successAlphaScale,
} as const);
