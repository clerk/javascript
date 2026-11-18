import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

export const styles = stylex.create({
  page: {
    gap: space['4'],
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  count: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
});
