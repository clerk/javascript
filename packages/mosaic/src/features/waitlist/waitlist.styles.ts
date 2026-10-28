import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  redirecting: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  footer: {
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
