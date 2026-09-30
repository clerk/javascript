import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../../tokens.stylex';

const compact = '@container cl-section (width < 26rem)';

export const styles = stylex.create({
  checkboxField: {
    gap: space['2'],
    alignItems: 'flex-start',
    display: 'flex',
  },
  checkbox: {
    accentColor: colorVars['--cl-color-brand'],
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
    color: colorVars['--cl-color-foreground-secondary'],
  },
  managedBy: {
    gap: space['1.5'],
    alignItems: 'center',
    display: 'flex',
  },
  managedByText: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  managedByFull: {
    display: { [compact]: 'none', default: 'inline' },
  },
  managedByName: {
    display: { [compact]: 'inline', default: 'none' },
  },
});
