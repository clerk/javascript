import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

const neutralScrim = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 6%, transparent)`;

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
    backgroundColor: neutralScrim,
  },
});

export const sizes = stylex.create({
  sm: { height: space['7'] },
  md: { height: space['8'] },
  lg: { height: space['9'] },
  xl: { height: space['10'] },
});
