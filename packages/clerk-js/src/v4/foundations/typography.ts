const fontWeights = Object.freeze({
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const);

const lineHeights = Object.freeze({
  normal: 'normal',
  none: '1rem',
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: '2',
} as const);

const letterSpacings = Object.freeze({
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const);

const fontSizes = Object.freeze({
  xxs: '0.625rem',
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
} as const);

const fontStyles = Object.freeze({
  normal: 'normal',
} as const);

const fonts = Object.freeze({} as const);

export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
