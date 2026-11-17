import * as stylex from '@stylexjs/stylex';

import { radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  rowAvatar: {
    '--_cl-avatar-radius': radiusVars['--cl-radius-sm'],
    fontSize: '0.5rem',
    height: space['5'],
    width: space['5'],
  },

  // The organization list scrolls; the header and footer stay put. The scroll area carries the
  // overflow, the edge fades, the scrollbar and the scroll padding they need, so only the cap
  // is ours.
  scroll: {
    maxHeight: '18rem',
  },

  popup: {
    width: 'min(21.875rem, calc(100vw - 2rem))',
  },
});
