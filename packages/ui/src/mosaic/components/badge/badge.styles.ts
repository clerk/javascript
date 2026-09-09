import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// warning/negative/positive fill with the subtle surface and use the saturated token as text;
// primary fills with the solid token and uses its `-foreground` for text.
//
// Neutral has no subtle surface to fill — `--cl-color-foreground-secondary` is a text gray, and its
// `-foreground` is a text color rather than an on-fill one, so it is unreadable against the solid
// 900. It rides the same black/white scrim the button's neutral fill does, which composites against
// any backdrop. Must be a local binding — StyleX inlines it; an imported one fails to compile.
const neutralScrim = `color-mix(in oklab, light-dark(oklch(0 0 0), oklch(1 0 0)) 6%, transparent)`;
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
    backgroundColor: colorVars['--cl-color-brand'],
    color: colorVars['--cl-color-brand-foreground'],
  },
  neutral: {
    backgroundColor: neutralScrim,
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
