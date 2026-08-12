import * as stylex from '@stylexjs/stylex';

import { surfaceVars } from '../../surface.vars.stylex';
import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['5'],
    width: '100%',
  },
  header: {
    paddingInline: space['4'],
    display: 'flex',
    flexDirection: 'column',
    paddingBlockStart: space['5'],
  },
  content: {
    paddingInline: space['4'],
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
  },
  footer: {
    gap: space['2'],
    paddingBlock: space['4'],
    paddingInline: space['6'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'space-between',
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    width: '100%',
  },
  branding: {
    paddingBlock: space['3'],
    paddingInline: space['6'],
    borderBlockStartColor: colorVars['--cl-color-border-faded'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    textAlign: 'center',
  },
  brandingText: {
    color: colorVars['--cl-color-neutral-faded'],
    display: 'inline-block',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    textWrap: 'pretty',
  },
  brandingLink: {
    borderRadius: radiusVars['--cl-radius-sm'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    outlineOffset: '2px',
    verticalAlign: 'top',
    height: space['4'],
  },
});

// A card is the surface an overlay paints, and overlays scale on open — on an ancestor, since
// the floating box itself is chrome-free. `scale` scales the rendered radius too, so the corners
// would read as 94% round for the whole transition. Dividing by the factor the ancestor publishes
// draws them at their authored size at every step. Registered `<number>`, `initial-value: 1`, so
// with no scaling ancestor this is a division by one and the card learns nothing about motion.
const surfaceRadius = `calc(${radiusVars['--cl-radius-xl']} / ${surfaceVars['--_cl-surface-scale']})`;

export const elevations = stylex.create({
  card: {
    borderRadius: surfaceRadius,
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
  },
  flush: {
    borderRadius: surfaceRadius,
    overflow: 'visible',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  overlay: {
    borderRadius: surfaceRadius,
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
  },
});

export const headerAlignments = stylex.create({
  start: {
    alignItems: 'flex-start',
    textAlign: 'start',
  },
  center: {
    alignItems: 'center',
    textAlign: 'center',
  },
});
