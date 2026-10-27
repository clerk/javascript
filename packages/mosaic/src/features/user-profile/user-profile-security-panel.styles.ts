import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'block',
    height: space['4.5'],
    width: space['4.5'],
  },
  sectionCards: {
    gap: space['3'],
    display: 'flex',
    flexDirection: 'column',
  },
});
