import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const tableTabStyles = stylex.create({
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
});
