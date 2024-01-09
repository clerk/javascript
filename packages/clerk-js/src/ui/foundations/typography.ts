const fontWeights = Object.freeze({
  normal: 400,
  medium: 500,
  bold: 700,
} as const);

const lineHeights = Object.freeze({
  normal: 'normal',
  none: '1rem',
  small: '1.125rem',
  medium: '1.5rem',
  large: '2rem',
} as const);

const letterSpacings = Object.freeze({
  normal: '0',
} as const);

// We want to achieve the md size to be 13px for root font size of 16px
// This is directly related to the createFontSizeScale function in the theme
// ref: src/ui/customizables/parseVariables.ts
const fontSizes = Object.freeze({
  xs: '0.65rem',
  sm: '0.73125rem',
  md: '0.8125rem',
  lg: '1.05625rem',
  xl: '1.503125rem',
} as const);

const fontStyles = Object.freeze({
  normal: 'normal',
} as const);

const fonts = Object.freeze({
  main: 'inherit',
  buttons: 'inherit',
} as const);

export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
