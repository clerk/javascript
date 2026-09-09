import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: colorVars['--cl-color-brand'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  message: {
    margin: 0,
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  error: {
    gap: space['1'],
    alignItems: 'flex-start',
    color: colorVars['--cl-color-negative'],
    display: 'flex',
    textWrap: 'pretty',
  },
  errorIcon: {
    flexShrink: 0,
    height: '1lh',
  },
});
