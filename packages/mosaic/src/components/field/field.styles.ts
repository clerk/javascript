import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    gap: space['2'],
    display: 'flex',
    flexDirection: 'column',
  },
  horizontal: {
    gap: `${space['1']} ${space['3']}`,
    alignItems: 'center',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
  },
  horizontalContent: {
    gridColumn: '2',
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
