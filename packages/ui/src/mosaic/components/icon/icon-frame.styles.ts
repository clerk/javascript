import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

// Figma uses the 'page faded' token
const filledBackground = 'light-dark(oklch(0.9702 0 0), oklch(0.2393 0 0))';

export const styles = stylex.create({
  base: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    backgroundColor: 'transparent',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  bordered: {
    borderColor: colorVars['--cl-color-border'],
  },
  filled: {
    backgroundColor: filledBackground,
  },
});

export const sizes = stylex.create({
  sm: { height: space['7'] },
  md: { height: space['8'] },
  lg: { height: space['9'] },
  xl: { height: space['10'] },
});
