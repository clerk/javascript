import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// warning/negative/positive tint a faded fill and use the saturated token as text;
// primary/neutral fill with the solid token and use its `-foreground` for text.
export const styles = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-full'],
    gap: space['1'],
    paddingInline: space['2'],
    alignItems: 'center',
    display: 'inline-flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    whiteSpace: 'nowrap',
    height: space['5'],
  },
});

export const colors = stylex.create({
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
