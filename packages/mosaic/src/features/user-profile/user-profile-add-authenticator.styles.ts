import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  verification: {
    paddingBlockStart: 0,
  },
  field: {
    paddingBlockStart: space['4'],
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  label: {
    textAlign: 'center',
  },
});
