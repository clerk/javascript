import {
  createAlphaScaleWithTransparentize,
  createColorMixLightnessScale,
  lighten,
  transparentize,
} from '../utils/colorMix';
import { clerkCssVar } from '../utils/css';

type ColorScale<Prefix extends string> = {
  [K in `${Prefix}${'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'}`]: string;
};

// Create alpha scales separately to preserve types
export const whiteAlpha = createAlphaScaleWithTransparentize('white', 'whiteAlpha');
export const neutralAlpha = createAlphaScaleWithTransparentize(clerkCssVar('neutral', 'black'), 'neutralAlpha');

const primaryAlpha = createAlphaScaleWithTransparentize(clerkCssVar('primary', '#2F3037'), 'primaryAlpha');
const dangerAlpha = createAlphaScaleWithTransparentize(clerkCssVar('danger', '#EF4444'), 'dangerAlpha');
const warningAlpha = createAlphaScaleWithTransparentize(clerkCssVar('warning', '#F36B16'), 'warningAlpha');
const successAlpha = createAlphaScaleWithTransparentize(clerkCssVar('success', '#22C543'), 'successAlpha');

const primaryScale = createColorMixLightnessScale(clerkCssVar('primary', '#2F3037'), 'primary');
const dangerScale = createColorMixLightnessScale(clerkCssVar('danger', '#EF4444'), 'danger');
const warningScale = createColorMixLightnessScale(clerkCssVar('warning', '#F36B16'), 'warning');
const successScale = createColorMixLightnessScale(clerkCssVar('success', '#22C543'), 'success');

// Define the base colors object type
type BaseColors = {
  avatarBorder: string;
  avatarBackground: string;
  modalBackdrop: string;
  colorBackground: string;
  colorInputBackground: string;
  colorText: string;
  colorTextSecondary: string;
  colorInputText: string;
  colorTextOnPrimaryBackground: string;
  colorShimmer: string;
  transparent: string;
  white: string;
  black: string;
  primaryHover: string;
};

// Combine all types
type Colors = BaseColors &
  ColorScale<'primary'> &
  ColorScale<'danger'> &
  ColorScale<'warning'> &
  ColorScale<'success'> &
  typeof neutralAlpha &
  typeof whiteAlpha &
  typeof primaryAlpha &
  typeof dangerAlpha &
  typeof warningAlpha &
  typeof successAlpha;

export const colors: Colors = Object.freeze({
  avatarBorder: neutralAlpha.neutralAlpha200,
  avatarBackground: neutralAlpha.neutralAlpha400,
  modalBackdrop: neutralAlpha.neutralAlpha700,
  // Themable colors
  ...neutralAlpha,
  ...whiteAlpha,
  colorBackground: clerkCssVar('background', 'white'),
  colorInputBackground: clerkCssVar('input', 'white'),
  colorText: clerkCssVar('foreground', '#212126'),
  colorTextSecondary: clerkCssVar('secondary-foreground', '#747686'),
  colorInputText: clerkCssVar('input-foreground', '#131316'),
  colorTextOnPrimaryBackground: clerkCssVar('primary-foreground', 'white'),
  colorShimmer: clerkCssVar('shimmer', transparentize('white', '36%')),
  transparent: 'transparent',
  white: 'white',
  black: 'black',
  ...primaryScale,
  // TODO(Colors): We are not adjusting the lightness based on the colorPrimary lightness
  primaryHover: lighten(clerkCssVar('primary', '#2F3037'), '25%'), // primary 500 adjusted for lightness
  ...primaryAlpha,
  ...dangerScale,
  ...dangerAlpha,
  ...warningScale,
  ...warningAlpha,
  ...successScale,
  ...successAlpha,
} as const);
