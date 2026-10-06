import * as stylex from '@stylexjs/stylex';

import { colorVars } from '../../tokens.stylex';

export const styles = stylex.create({
  addError: {
    gridColumnEnd: '-1',
    gridColumnStart: '1',
    marginTop: 0,
  },
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
