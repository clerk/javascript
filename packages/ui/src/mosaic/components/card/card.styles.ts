import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    paddingInline: space['4'],
    display: 'flex',
    flexDirection: 'column',
    paddingBlockEnd: space['5'],
    paddingBlockStart: space['5'],
  },
  content: {
    gap: space['4'],
    paddingInline: space['4'],
    display: 'flex',
    flexBasis: 'auto',
    flexDirection: 'column',
    flexGrow: '1',
    flexShrink: '1',
    paddingBlockEnd: space['5'],
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
    alignItems: 'center',
    color: 'inherit',
    display: 'inline-flex',
    verticalAlign: 'top',
    height: space['4'],
  },
});

export const elevations = stylex.create({
  card: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px light-dark(oklch(0.2046 0 0 / 12%), transparent),
                0 24px 24px -10px light-dark(oklch(0.2046 0 0 / 4%), transparent),
                0 0 0 1px light-dark(oklch(0.2046 0 0 / 4%), oklch(1 0 0 / 10%))`,
  },
  flush: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'visible',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  overlay: {
    borderRadius: radiusVars['--cl-radius-xl'],
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
