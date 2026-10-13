import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  horizontal: {
    gap: space['2'],
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  content: {
    '--_cl-feedback-gap': space['1'],
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
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
});
