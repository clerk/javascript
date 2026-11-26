import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  codeActions: {
    gap: space['2'],
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  footer: {
    justifyContent: 'center',
    paddingBlockStart: `max(0px, calc(${space['6']} - var(--_cl-card-content-end, 0px)))`,
  },
  footerText: {
    textAlign: 'center',
  },
});
