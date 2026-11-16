import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  divider: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
  },
  dividerLine: {
    backgroundColor: colorVars['--cl-color-border'],
    flexGrow: 1,
    height: '1px',
  },
  nameRow: {
    gap: space['4'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  spotlightGroup: {
    display: 'contents',
  },
  spotlightHidden: {
    display: 'none',
  },
});
