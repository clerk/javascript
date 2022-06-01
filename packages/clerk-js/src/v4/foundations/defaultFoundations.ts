import { colors } from './colors';
import { opacity } from './opacity';
import { shadows } from './shadows';
import { radii, sizes, space } from './sizes';
import { transitionDuration, transitionProperty, transitionTiming } from './transitions';
import { fonts, fontSizes, fontStyles, fontWeights, letterSpacings, lineHeights } from './typography';

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
  opacity,
} as const);

const defaultFoundationsCopy = (): InternalThemeFoundations => {
  return { ...defaultInternalThemeFoundations };
};

type InternalThemeFoundations = typeof defaultInternalThemeFoundations;

type PrefixWith<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;
type InternalTheme<F = InternalThemeFoundations> = {
  [scale in keyof F]: {
    [token in keyof F[scale] as PrefixWith<'$', token>]: F[scale][token];
  };
};

export { defaultInternalThemeFoundations, defaultFoundationsCopy };
export type { InternalTheme, InternalThemeFoundations };
