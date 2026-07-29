import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const item = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-element'],
    gap: space['3'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid color-mix(in oklab, ${colorVars['--cl-color-primary']} 50%, transparent)`,
    },
    paddingInline: space['2'],
    alignItems: 'center',
    boxSizing: 'border-box',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    outlineOffset: '2px',
    textAlign: 'start',
    width: '100%',
  },

  // interactive rows (rendered as a link/button via `render`) gain hover + cursor
  interactive: {
    backgroundColor: {
      default: null,
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    cursor: 'pointer',
  },

  // vertical density; horizontal padding is shared by the base
  md: {
    paddingBlock: space['2'],
  },
  flush: {
    paddingBlock: space['0'],
  },
});

export const media = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: 'fit-content',
  },
});

export const content = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
});

export const title = stylex.create({
  base: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
});

export const description = stylex.create({
  base: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});

export const actions = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
  },
});

export const group = stylex.create({
  base: {
    padding: space['2'],
    width: '100%',
  },
});

export const separator = stylex.create({
  base: {
    borderStyle: 'none',
    backgroundColor: colorVars['--cl-color-border'],
    flexShrink: 0,
    height: '1px',
    width: '100%',
  },
});
