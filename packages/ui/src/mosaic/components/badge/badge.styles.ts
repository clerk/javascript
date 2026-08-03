import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// warning/negative/positive tint a faded fill and use the saturated token as text;
// primary fills with the solid token and uses its `-foreground` for text.
//
// Neutral has no faded surface to tint — `--cl-color-neutral-faded` is a text gray, and its
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
    backgroundColor: neutralScrim,
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
