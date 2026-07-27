import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// Every intent is the same recipe applied to one token: the token itself is the
// text color, a 12% mix is the fill and a 24% mix the border. Mixing toward
// `transparent` rather than a surface token keeps the badge legible on any
// background it's dropped onto.
export const styles = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-full'],
    gap: space['1'],
    paddingInline: space['2'],
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-label-sm-size'],
    fontWeight: typeScaleVars['--cl-text-label-sm-weight'],
    justifyContent: 'center',
    lineHeight: typeScaleVars['--cl-text-label-sm-leading'],
    whiteSpace: 'nowrap',
    height: space['5'],
  },

  primary: {
    backgroundColor: colorVars['--cl-color-primary'],
    color: colorVars['--cl-color-primary-foreground'],
  },
  neutral: {
    backgroundColor: colorVars['--cl-color-neutral'],
    color: colorVars['--cl-color-neutral-foreground'],
  },
  warning: {
    backgroundColor: colorVars['--cl-color-warning-faded'],
    color: colorVars['--cl-color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--cl-color-negative-faded'],
    color: colorVars['--cl-color-negative'],
  },
  positive: {
    backgroundColor: colorVars['--cl-color-positive-faded'],
    color: colorVars['--cl-color-positive'],
  },
});
