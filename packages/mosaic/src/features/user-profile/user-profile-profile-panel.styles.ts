import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground'],
    display: 'flex',
    minWidth: 0,
  },
  contactText: {
    minWidth: 0,
  },
  providerIcon: {
    display: 'block',
    height: space['5'],
    width: space['5'],
  },
});
