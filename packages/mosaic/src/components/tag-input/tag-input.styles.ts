import * as stylex from '@stylexjs/stylex';

import { colorVars } from '../../tokens.stylex';

export const styles = stylex.create({
  disabled: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 5%, transparent)`,
    cursor: 'not-allowed',
  },
  list: {
    display: 'contents',
  },
  tagInvalid: {
    backgroundColor: colorVars['--cl-color-negative-subtle'],
    color: colorVars['--cl-color-negative'],
  },
});
