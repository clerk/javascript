import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  countdown: {
    fontVariantNumeric: 'tabular-nums',
  },
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  providerIcon: {
    display: 'block',
    height: space['5'],
    width: space['5'],
  },
});
