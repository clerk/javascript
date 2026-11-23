import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  codeActions: {
    gap: space['2'],
    display: 'flex',
    flexWrap: 'wrap',
  },
  footer: {
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});
