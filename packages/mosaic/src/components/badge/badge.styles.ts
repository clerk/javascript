import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// Every color but primary fills with its `-subtle` token and uses the saturated token as text;
// primary fills with the solid token and uses its `-foreground` for text. Every `-subtle` is a
// wash, so the chip stays visible on the page, the surface and the faded surface alike.
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
    maxWidth: '100%',
    minWidth: 0,
  },
});

export const colors = stylex.create({
  primary: {
    backgroundColor: colorVars['--cl-color-brand'],
    color: colorVars['--cl-color-brand-foreground'],
  },
  neutral: {
    backgroundColor: colorVars['--cl-color-neutral-subtle'],
    color: colorVars['--cl-color-foreground'],
  },
  warning: {
    backgroundColor: colorVars['--cl-color-warning-subtle'],
    color: colorVars['--cl-color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--cl-color-negative-subtle'],
    color: colorVars['--cl-color-negative'],
  },
  positive: {
    backgroundColor: colorVars['--cl-color-positive-subtle'],
    color: colorVars['--cl-color-positive'],
  },
});
