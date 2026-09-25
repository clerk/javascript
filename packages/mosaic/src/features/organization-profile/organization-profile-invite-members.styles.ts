import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  labelRow: {
    alignItems: 'baseline',
    columnGap: space['2'],
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
