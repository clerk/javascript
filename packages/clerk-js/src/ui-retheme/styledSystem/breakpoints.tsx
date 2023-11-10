import { fromEntries } from '../utils/fromEntries';

const breakpoints = Object.freeze({
  xs: '21em', // 336px
  sm: '30em', // 480px
  md: '48em', // 768px
  lg: '62em', // 992px
  xl: '80em', // 1280px
  '2xl': '96em', // 1536px
} as const);

const deviceQueries = {
  ios: '@supports (-webkit-touch-callout: none)',
} as const;

// export const mq = Object.fromEntries(
//   Object.entries(breakpoints).map(([k, v]) => [k, `@media (min-width: ${v})`]),
// ) as Record<keyof typeof breakpoints, string>;

export const mqu = {
  ...deviceQueries,
  ...fromEntries(Object.entries(breakpoints).map(([k, v]) => [k, `@media (max-width: ${v})`])),
} as Record<keyof typeof breakpoints | keyof typeof deviceQueries, string>;
