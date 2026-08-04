import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  label: {
    color: colorVars['--cl-color-card-foreground'],
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
  },
  disabledText: {
    opacity: 0.5,
  },
});
