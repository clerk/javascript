import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    backgroundColor: colorVars['--cl-color-background'],
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['10'],
  },
});
