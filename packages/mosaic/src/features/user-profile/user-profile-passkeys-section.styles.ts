import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  addError: {
    marginTop: `calc(-1 * ${space['0.5']})`,
  },
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
