import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  addError: {
    marginTop: {
      default: space['2'],
      ':where(:not([data-open]), [data-starting-style])': 0,
    },
  },
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
