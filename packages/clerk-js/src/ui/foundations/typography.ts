const fontWeights = Object.freeze({
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
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
const fontSizes = Object.freeze({
  xs: '0.6875rem',
  sm: '0.75rem',
  md: '0.8125rem',
  lg: '1.0625rem',
  xl: '1.5rem',
} as const);

const fontStyles = Object.freeze({
  normal: 'normal',
} as const);

const fonts = Object.freeze({
  main: 'inherit',
  buttons: 'inherit',
} as const);

export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
