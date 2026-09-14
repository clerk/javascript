import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../../tokens.stylex';

export const styles = stylex.create({
  checkboxField: {
    gap: space['2'],
    alignItems: 'flex-start',
    display: 'flex',
  },
  checkbox: {
    accentColor: colorVars['--cl-color-primary'],
    cursor: 'pointer',
    flexShrink: 0,
    marginBlockStart: '2px',
    height: space['4'],
    width: space['4'],
  },
  checkboxCopy: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxLabel: {
    cursor: 'pointer',
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  checkboxDescription: {
    color: colorVars['--cl-color-neutral-faded'],
  },
});
