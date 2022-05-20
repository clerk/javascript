import { colors } from './colors';
import { createInternalTheme } from './createInternalTheme';
import { shadows } from './shadows';
import { radii, sizes, space } from './sizes';
import { fonts, fontSizes, fontWeights, letterSpacings, lineHeights } from './typography';

export const baseTheme = createInternalTheme({
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  sizes,
  space,
  shadows,
});

type BaseTheme = typeof baseTheme;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends BaseTheme {}
}
