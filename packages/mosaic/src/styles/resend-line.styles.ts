import * as stylex from '@stylexjs/stylex';

import { typeScaleVars } from '../tokens.stylex';

export const resendLine = stylex.create({
  start: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  center: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textAlign: 'center',
  },
});
