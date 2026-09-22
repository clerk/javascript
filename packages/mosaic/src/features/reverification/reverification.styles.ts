import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

const stackedFooter = '@container card (max-width: 20rem)' as const;
const half = `calc(50% - ${space['1']})`;

export const styles = stylex.create({
  pending: {
    paddingBlock: space['12'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  pendingAction: {
    flexBasis: { default: half, [stackedFooter]: 'auto' },
    flexGrow: { default: 0, [stackedFooter]: 1 },
    flexShrink: 0,
    marginInlineStart: { default: 'auto', [stackedFooter]: 0 },
    width: { default: half, [stackedFooter]: '100%' },
  },
});
