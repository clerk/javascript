import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const item = stylex.create({
  base: {
    padding: space['2'],
    borderRadius: radiusVars['--cl-radius-element'],
    gap: space['3'],
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
    transitionProperty: 'background-color, color',
    width: '100%',
  },

  // interactive rows (rendered as a link/button via `render`) gain hover + cursor
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
});

export const media = stylex.create({
  // sizes to its child; height follows the row (taller on a 2-line item, shorter on a button).
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
    fontSize: typeScaleVars['--cl-text-label-sm-size'],
    fontWeight: 400,
    lineHeight: typeScaleVars['--cl-text-label-sm-leading'],
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
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});

export const separator = stylex.create({
  base: {
    borderStyle: 'none',
    marginBlock: space['2'],
    marginInline: 0,
    backgroundColor: colorVars['--cl-color-border'],
    flexShrink: 0,
    height: '1px',
    width: '100%',
  },
});
