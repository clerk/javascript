import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: colorVars['--cl-color-primary'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  message: {
    margin: 0,
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
  },
  error: {
    gap: space['1'],
    alignItems: 'flex-start',
    color: colorVars['--cl-color-negative'],
    display: 'flex',
  },
  errorIcon: {
    flexShrink: 0,
    height: '1lh',
  },
});
