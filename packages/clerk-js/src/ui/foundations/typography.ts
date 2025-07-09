import { clerkCssVar } from '../utils/cssVariables';

const fontWeights = Object.freeze({
  normal: clerkCssVar('font-weight-normal', clerkCssVar('font-weight', '400')),
  medium: clerkCssVar('font-weight-medium', '500'),
  semibold: clerkCssVar('font-weight-semibold', '600'),
  bold: clerkCssVar('font-weight-bold', '700'),
} as const);

const lineHeights = Object.freeze({
  normal: 'normal',
  extraSmall: '1.33333',
  small: '1.38462',
  medium: '1.41176',
  large: '1.45455',
} as const);

const letterSpacings = Object.freeze({
  normal: 'normal',
} as const);

// We want to achieve the md size to be 13px for root font size of 16px
// This is directly related to the createFontSizeScale function in the theme
// ref: src/ui/customizables/parseVariables.ts
const fontSizesDefaultVar = clerkCssVar('font-size', '0.8125rem');
const fontSizes = Object.freeze({
  xs: clerkCssVar('font-size-xs', `calc(${fontSizesDefaultVar} * 0.8)`), // 0.6875rem
  sm: clerkCssVar('font-size-sm', `calc(${fontSizesDefaultVar} * 0.9)`), // 0.75rem
  md: clerkCssVar('font-size-md', fontSizesDefaultVar),
  lg: clerkCssVar('font-size-lg', `calc(${fontSizesDefaultVar} * 1.3)`), // 1.0625rem
  xl: clerkCssVar('font-size-xl', `calc(${fontSizesDefaultVar} * 1.85)`), // 1.5rem
} as const);

const fontStyles = Object.freeze({
  normal: 'normal',
} as const);

const fonts = Object.freeze({
  main: clerkCssVar('font-family', 'inherit'),
  buttons: clerkCssVar('font-family-buttons', clerkCssVar('font-family', 'inherit')),
} as const);

export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
