import { borderStyles, borderWidths } from './borders';
import { colors } from './colors';
import { opacity } from './opacity';
import { shadows } from './shadows';
import { radii, sizes, space } from './sizes';
import { transitionDuration, transitionDurationValues, transitionProperty, transitionTiming } from './transitions';
import { fonts, fontSizes, fontStyles, fontWeights, letterSpacings, lineHeights } from './typography';
import { zIndices } from './zIndices';

const defaultInternalThemeFoundations = Object.freeze({
  colors,
  fonts,
  fontStyles,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  sizes,
  space,
  shadows,
  transitionProperty,
  transitionTiming,
  transitionDuration,
  transitionDurationValues,
  opacity,
  borderStyles,
  borderWidths,
  zIndices,
} as const);

type InternalThemeFoundations = typeof defaultInternalThemeFoundations;

type PrefixWith<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;
type InternalTheme<F = InternalThemeFoundations> = {
  [scale in keyof F]: {
    [token in keyof F[scale] as PrefixWith<'$', token>]: F[scale][token];
  };
};

export { defaultInternalThemeFoundations };
export type { InternalTheme, InternalThemeFoundations };
