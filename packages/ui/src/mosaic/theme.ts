// Ceramic Colors (from CSS variables)
const gray = {
  50: '#fafafb',
  100: '#f6f6f7',
  200: '#ececee',
  300: '#dbdbe0',
  400: '#c7c7cf',
  500: '#adadb7',
  600: '#90909d',
  700: '#767684',
  800: '#5f5f6f',
  900: '#4c4c5c',
  1000: '#3d3d4a',
  1100: '#33333e',
  1200: '#2b2b34',
  1300: '#232328',
  1400: '#1b1b1f',
  1500: '#111113',
} as const;

const purple = {
  50: '#f5f3ff',
  100: '#e3e0ff',
  200: '#ccc8ff',
  300: '#bab0ff',
  400: '#a698ff',
  500: '#9280ff',
  600: '#846bff',
  700: '#6c47ff',
  800: '#5f15fe',
  900: '#4d06d1',
  1000: '#3707a6',
  1100: '#27057c',
  1200: '#1c045f',
  1300: '#16034b',
} as const;

const green = {
  50: '#effdf1',
  100: '#aff9bf',
  200: '#65f088',
  300: '#49dc6e',
  400: '#31c854',
  500: '#1eb43c',
  600: '#199d34',
  700: '#15892b',
  800: '#107524',
  900: '#09661c',
  1000: '#0b5619',
  1100: '#0c4919',
  1200: '#0c3c18',
  1300: '#053211',
} as const;

const red = {
  50: '#fef8f8',
  100: '#fedddd',
  200: '#fec4c4',
  300: '#fca9a9',
  400: '#f98a8a',
  500: '#f86969',
  600: '#f73d3d',
  700: '#e02e2e',
  800: '#c22a2a',
  900: '#aa1b1b',
  1000: '#921414',
  1100: '#7a1313',
  1200: '#651414',
  1300: '#550e0e',
  1400: '#3d0101',
  1500: '#2d0101',
} as const;

const orange = {
  50: '#fff8f2',
  100: '#ffe4c4',
  200: '#fecc9f',
  300: '#feb166',
  400: '#fd9357',
  500: '#fd7224',
  600: '#e06213',
  700: '#c3540f',
  800: '#a8470c',
  900: '#9d3405',
  1000: '#8a2706',
  1100: '#75220b',
  1200: '#5f1e0c',
  1300: '#50170a',
} as const;

const yellow = {
  50: '#fefbdc',
  100: '#f7ed55',
  200: '#e5d538',
  300: '#d7be35',
  400: '#c0aa18',
  500: '#bd9005',
  600: '#a47c04',
  700: '#8d6b03',
  800: '#775902',
  900: '#674401',
  1000: '#563202',
  1100: '#412303',
  1200: '#321904',
  1300: '#2a1203',
} as const;

const blue = {
  50: '#f6faff',
  100: '#daeafe',
  200: '#b4d5fe',
  300: '#8dc2fd',
  400: '#73acfa',
  500: '#6694f8',
  600: '#307ff6',
  700: '#236dd7',
  800: '#1c5bb6',
  900: '#1744a6',
  1000: '#0f318e',
  1100: '#0e2369',
  1200: '#0b1c49',
  1300: '#0c1637',
} as const;

// Typography - Labels
const label = {
  1: { fontSize: '1rem', lineHeight: '1.375rem', fontWeight: 500 },
  2: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500 },
  3: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 500 },
  4: {
    fontSize: '0.6875rem',
    lineHeight: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.015em',
  },
  5: { fontSize: '0.625rem', lineHeight: '0.8125rem', fontWeight: 500 },
} as const;

// Typography - Headings
const heading = {
  1: {
    fontSize: '2.25rem',
    lineHeight: '2.5rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  2: {
    fontSize: '2rem',
    lineHeight: '2.25rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  3: {
    fontSize: '1.75rem',
    lineHeight: '2.125rem',
    fontWeight: 500,
    letterSpacing: '-0.015em',
  },
  4: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  5: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  6: { fontSize: '1.0625rem', lineHeight: '1.5rem', fontWeight: 500 },
} as const;

// Typography - Body
const body = {
  1: { fontSize: '1rem', lineHeight: '1.375rem', fontWeight: 400 },
  2: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
  3: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 400,
    letterSpacing: '0.01em',
  },
  4: { fontSize: '0.6875rem', lineHeight: '0.875rem', fontWeight: 400 },
} as const;

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

const fontFamilies = {
  sans: 'var(--font-suisse), system-ui, sans-serif',
  mono: 'var(--font-soehne-mono), ui-monospace, monospace',
} as const;

// Theme object
export const mosaicTheme = {
  colors: {
    gray,
    purple,
    green,
    red,
    orange,
    yellow,
    blue,
    white: '#fff',
    black: '#000',
  },
  typography: {
    label,
    heading,
    body,
  },
  fontWeights,
  fontFamilies,
} as const;

export type MosaicTheme = typeof mosaicTheme;
