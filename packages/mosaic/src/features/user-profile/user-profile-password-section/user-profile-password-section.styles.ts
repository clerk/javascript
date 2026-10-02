import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../../tokens.stylex';

export const styles = stylex.create({
  managedBy: {
    gap: space['1.5'],
    alignItems: 'center',
    display: 'flex',
  },
  managedByText: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
