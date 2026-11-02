import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  logo: {
    alignItems: 'center',
    columnGap: space['4'],
    display: 'flex',
  },
  logoContent: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    rowGap: space['1'],
    minWidth: 0,
  },
  logoActions: {
    columnGap: space['2'],
    display: 'flex',
  },
});
