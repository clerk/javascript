import { colors } from './colors';
import { createInternalTheme } from './createInternalTheme';
import { opacity } from './opacity';
import { shadows } from './shadows';
import { radii, sizes, space } from './sizes';
import { transitionDuration, transitionProperty, transitionTiming } from './transitions';
import { fonts, fontSizes, fontStyles, fontWeights, letterSpacings, lineHeights } from './typography';

export const baseTheme = createInternalTheme({
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
});

export type BaseTheme = typeof baseTheme;
