import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  // The mark only: text and link. Where it sits (a card's foot, a sidebar's) is the host's call.
  base: {
    color: colorVars['--cl-color-neutral-faded'],
    display: 'inline-block',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    textWrap: 'pretty',
  },
  link: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    verticalAlign: 'top',
    height: space['4'],
  },
});
