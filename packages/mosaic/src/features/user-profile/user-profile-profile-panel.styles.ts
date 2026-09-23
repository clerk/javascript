import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  countdown: {
    display: 'inline-block',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    minWidth: '2ch',
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
