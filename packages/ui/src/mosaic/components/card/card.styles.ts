import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const root = stylex.create({
  base: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
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

export const header = stylex.create({
  // `row-reverse` so the dismiss button leads in the DOM — and so takes the dialog's opening
  // focus — while sitting at the inline end.
  base: {
    paddingInline: space['5'],
    columnGap: space['1'],
    display: 'flex',
    flexDirection: 'row-reverse',
    paddingBlockStart: space['4'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    rowGap: space['1'],
  },
  title: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    fontWeight: fontWeightVars['--cl-font-semibold'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
    textWrap: 'balance',
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'pretty',
  },
});

export const content = stylex.create({
  base: {
    paddingBlock: space['4'],
    paddingInline: space['5'],
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
  },
});

export const footer = stylex.create({
  base: {
    gap: space['2'],
    paddingBlock: space['4'],
    paddingInline: space['5'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'space-between',
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    width: '100%',
  },
});

export const branding = stylex.create({
  base: {
    paddingBlock: space['3'],
    paddingInline: space['6'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    textAlign: 'center',
  },
  text: {
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
