import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  footer: {
    justifyContent: 'center',
  },
  signOut: {
    alignItems: 'center',
    columnGap: space['1'],
    display: 'flex',
    justifyContent: 'center',
    minWidth: 0,
  },
  identifier: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  signOutAction: {
    flexShrink: 0,
  },
});
