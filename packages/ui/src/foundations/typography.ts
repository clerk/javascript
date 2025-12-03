import { clerkCssVar } from '../utils/cssVariables';

const fontWeights = Object.freeze({
  normal: clerkCssVar('font-weight-normal', clerkCssVar('font-weight', '400')),
  medium: clerkCssVar('font-weight-medium', '500'),
  semibold: clerkCssVar('font-weight-semibold', '600'),
  bold: clerkCssVar('font-weight-bold', '700'),
} as const);

const lineHeights = Object.freeze({
  normal: 'normal',
  extraSmall: 'calc(16 / 12)', // = 1.33333
  small: 'calc(18 / 13)', // = 1.38462
  medium: 'calc(24 / 17)', // = 1.41176
  large: 'calc(16 / 11)', // = 1.45455
} as const);

const letterSpacings = Object.freeze({
  normal: 'normal',
} as const);

export const FONT_SIZE_SCALE_RATIOS = Object.freeze({
  xs: '11 / 13', // 0.846154
  sm: '12 / 13', // 0.923077
  md: '1', // 1.0
  lg: '17 / 13', // 1.307692
  xl: '24 / 13', // 1.846154
} as const);

export type FontSizeKey = keyof typeof FONT_SIZE_SCALE_RATIOS;

const fontSizesDefaultVar = clerkCssVar('font-size', '0.8125rem');
const fontSizes = Object.freeze({
  xs: clerkCssVar('font-size-xs', `calc(${fontSizesDefaultVar} * ${FONT_SIZE_SCALE_RATIOS.xs})`), // 0.6875rem
  sm: clerkCssVar('font-size-sm', `calc(${fontSizesDefaultVar} * ${FONT_SIZE_SCALE_RATIOS.sm})`), // 0.75rem
  md: clerkCssVar('font-size-md', fontSizesDefaultVar), // 0.8125rem
  lg: clerkCssVar('font-size-lg', `calc(${fontSizesDefaultVar} * ${FONT_SIZE_SCALE_RATIOS.lg})`), // 1.0625rem
  xl: clerkCssVar('font-size-xl', `calc(${fontSizesDefaultVar} * ${FONT_SIZE_SCALE_RATIOS.xl})`), // 1.5rem
} as const);

const fontStyles = Object.freeze({
  normal: 'normal',
} as const);

const fonts = Object.freeze({
  main: clerkCssVar('font-family', 'inherit'),
  buttons: clerkCssVar('font-family-buttons', clerkCssVar('font-family', 'inherit')),
} as const);

export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
