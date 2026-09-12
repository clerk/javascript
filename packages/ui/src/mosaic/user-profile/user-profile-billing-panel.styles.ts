import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  amount: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    fontWeight: fontWeightVars['--cl-font-semibold'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
  },
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  sections: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
