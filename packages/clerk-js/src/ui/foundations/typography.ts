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
