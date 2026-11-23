import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  amount: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    fontWeight: fontWeightVars['--cl-font-semibold'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
  },
});
