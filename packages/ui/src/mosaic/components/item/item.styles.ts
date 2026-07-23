import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const item = stylex.create({
  base: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-element'],
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: {
      default: 'none',
      ':focus-visible': `2px solid color-mix(in oklab, ${colorVars['--cl-color-primary']} 50%, transparent)`,
    },
    alignItems: 'center',
    boxSizing: 'border-box',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-label-size'],
    lineHeight: typeScaleVars['--cl-text-label-leading'],
    outlineOffset: '2px',
    textAlign: 'start',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, border-color, color',
    width: '100%',
  },

  variantDefault: { backgroundColor: 'transparent' },
  variantOutline: { borderColor: colorVars['--cl-color-border'], backgroundColor: 'transparent' },
  variantMuted: {
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-muted']} 50%, transparent)`,
  },

  // size — generous block padding; the inline axis stays constant
  sizeMd: { padding: space['4'], gap: space['4'] },
  sizeSm: { gap: space['2.5'], paddingBlock: space['3'], paddingInline: space['4'] },

  // interactive rows (rendered as a link/button via asChild) gain hover + cursor
  interactive: {
    backgroundColor: {
      default: null,
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-muted']} 70%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-muted']} 50%, transparent)`,
      },
    },
    cursor: 'pointer',
  },

  disabled: { cursor: 'not-allowed', opacity: 0.5, pointerEvents: 'none' },
});

export const media = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  icon: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-inner'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-muted'],
    boxSizing: 'border-box',
    height: space['8'],
    width: space['8'],
  },
  image: {
    borderRadius: radiusVars['--cl-radius-inner'],
    overflow: 'hidden',
    height: space['10'],
    width: space['10'],
  },
});

export const content = stylex.create({
  base: {
    gap: space['1'],
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
});

export const title = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-label-size'],
    fontWeight: typeScaleVars['--cl-text-label-weight'],
    lineHeight: typeScaleVars['--cl-text-label-leading'],
    width: 'fit-content',
  },
});

export const description = stylex.create({
  base: {
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    color: colorVars['--cl-color-muted-foreground'],
    display: '-webkit-box',
    fontSize: typeScaleVars['--cl-text-label-size'],
    fontWeight: 400,
    lineHeight: typeScaleVars['--cl-text-label-leading'],
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

// ItemHeader / ItemFooter share the same full-width band layout.
export const band = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexBasis: '100%',
    justifyContent: 'space-between',
  },
});

export const group = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const separator = stylex.create({
  base: {
    margin: 0,
    borderStyle: 'none',
    backgroundColor: colorVars['--cl-color-border'],
    flexShrink: 0,
    height: '1px',
    width: '100%',
  },
});
